# Pre-Migration Checklist

Before starting any major refactoring, migration, or risky changes:

## 1. Commit Current Work
```bash
git add -A
git commit -m "WIP: [description of current state]"
git tag backup-$(date +%Y%m%d-%H%M%S)
```

## 2. Create a Branch (Optional but Recommended)
```bash
git checkout -b feature/[migration-name]
```

## 3. Document What's Being Changed
- List files that will be modified
- Note current working features
- Identify dependencies

## 4. Verify Backup
```bash
git log -1
git tag -l
```

## 5. Proceed with Changes
Only after steps 1-4 are complete.

## Rollback Plan
```bash
# If things go wrong:
git reset --hard [tag-name]
# or
git checkout main && git branch -D feature/[migration-name]
```
