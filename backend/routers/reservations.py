from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
import uuid
import psycopg2

router = APIRouter(prefix="/api/v1/reservations", tags=["reservations"])

class ReservationCreateRequest(BaseModel):
    equipment_id: str
    start_time: datetime
    end_time: datetime

@router.post("", status_code=status.HTTP_201_CREATED)
def create_reservation(payload: ReservationCreateRequest, db_conn = Depends(), current_user: dict = Depends()):
    """
    POST /api/v1/reservations following SAD sequence 4.1:
    - Validate request and open transaction
    - SELECT ... FOR UPDATE on the equipment row
    - Insert reservation with unique UUID token, commit, return 201 Created with the token
    - Roll back and return the right code (400/409/422) on failure
    """
    cursor = db_conn.cursor()
    try:
        # 1. Open transaction explicitly / start block
        db_conn.begin()

        # 2. SELECT ... FOR UPDATE on the equipment row to lock the row and prevent race conditions
        cursor.execute(
            "SELECT equipment_id, status FROM equipment WHERE equipment_id = %s FOR UPDATE;",
            (payload.equipment_id,)
        )
        equipment = cursor.fetchone()
        
        if not equipment:
            db_conn.rollback()
            raise HTTPException(status_code=404, detail="Equipment not found.")
        
        if equipment[1] != 'AVAILABLE':
            db_conn.rollback()
            raise HTTPException(status_code=422, detail="Equipment is currently under maintenance or out of order.")

        # Validate time bounds
        if payload.end_time <= payload.start_time:
            db_conn.rollback()
            raise HTTPException(status_code=400, detail="End time must be after start time.")

        # 3. Generate unique UUID token
        reservation_token = uuid.uuid4()
        reservation_id = uuid.uuid4()

        # 4. Insert reservation (GIST exclusion constraint handles double-booking protection atomically)
        cursor.execute(
            """
            INSERT INTO reservations (reservation_id, equipment_id, student_id, start_time, end_time, status, token)
            VALUES (%s, %s, %s, %s, %s, 'CONFIRMED', %s)
            RETURNING reservation_id, token, start_time, end_time;
            """,
            (
                reservation_id, 
                payload.equipment_id, 
                current_user.get("user_id"), 
                payload.start_time, 
                payload.end_time, 
                reservation_token
            )
        )
        
        db_conn.commit()
        return {
            "status": "success",
            "code": 201,
            "data": {
                "reservation_id": str(reservation_id),
                "token": str(reservation_token),
                "start_time": payload.start_time,
                "end_time": payload.end_time
            }
        }

    except psycopg2.IntegrityError as e:
        db_conn.rollback()
        error_msg = str(e)
        # Catch GIST exclusion constraint violations for overlapping slots
        if "exclude" in error_msg.lower() or "overlapping" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="Time slot conflict: Equipment is already booked for this interval."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Integrity constraint violation during reservation."
        )
    except Exception as e:
        db_conn.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )
    finally:
        cursor.close()