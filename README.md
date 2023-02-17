# Habit Genie

Keep track of your habits and goals.



## TODO

- [ ] calculate streak
- [ ] Check habit status for ALL days
- [ ] when deleting habit, delete all habit logs
- [ ] Order habits
- [x] Check habit status for today

### calculating streaks

#### Option 1

- when creating a habit, set the streak to 0
- when checking a habit, check if the last habit log is the day before
  - if yes, increment the streak
  - if no, set the streak to 1

\* doesn't work if you go back and uncheck or check a habit from a previous day

#### Option 2

- do everything in the frontend
- read all habit logs for the habit that are completed
- calculate the current and longest streaks

\* works even if you go back and change, just need to recalculate

\* might be slow if you have a lot of habit logs, not sure if it's worth it to optimize at this point

---

## Tech Stack

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

Database from [planetscale](https://www.planetscale.com/).

Deployed to [Vercel](https://vercel.com).