# Homework Quiz #3

Open `/homework-3/` on the running server. It has a separate saved attempt from Quizzes #1 and #2.

This quiz has 34 reworded Form B questions: 17 Math (#92-108) and 17 English (#33-49). It uses the telegraph passage and "Snowy Mountains" poem. The relevant chart, network schematic, rectangular box, and similar-triangle drawing appear with their questions and in the results PDF.

The same adaptive ordering, choice shuffling, 60-minute default active timer, pause button, locked answers, warnings, and metrics apply. Set `BRCDC_HOMEWORK_3_MINUTES` to change the time allowance for new attempts. The report includes every question, even if time expires before a student reaches it. The downloaded PDF prints each reading passage beside its associated questions and again in a full Reading passages section at the end.

The three quizzes use 100 distinct questions from the 114-question Form B: 49 English and 51 Math. Source English #50-57 and Math #109-114 remain unused.

For deployment, upload the **contents** of `Upload/` to the top level of the GitHub repository, keeping the `vendor/` subfolder. Do not upload the `Upload` folder itself as a nested folder unless you set Render Root Directory to `Upload`. Redeploy the existing Render Web Service and use its public HTTPS address plus `/homework-3/` in Google Classroom.

Run `test-homework-3.cjs` locally with Node 24 or later to check question count, keys, unique source numbers, adaptive order, pause, and timeout behavior.
