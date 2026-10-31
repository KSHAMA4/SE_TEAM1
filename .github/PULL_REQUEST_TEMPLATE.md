## Pull Request Checklist

### Issue Reference
Closes #<ISSUE_NUMBER>

### Summary of Changes
- What was changed or added in this pull request?
- Why is it necessary?

### Test Coverage & Traceability
- [ ] Test cases mapped and executed (e.g., TC-001, TC-007):
- [ ] Unit / Integration tests passing locally
- [ ] CI pipeline passing on GitHub Actions

### Verification Steps
1. Step 1:
2. Step 2:

### Reviewer Checklist (to be checked by reviewer)
- [ ] Code follows layered architecture (Controllers -> Services -> Repositories)
- [ ] No direct SQL string concatenation (parameterized queries only)
- [ ] Proper HTTP status codes returned (200, 201, 400, 401, 403, 409, 422)
- [ ] No sensitive credentials or .env committed
