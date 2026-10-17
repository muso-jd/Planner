# Calendar-prorated allowances and distinct funding ledgers

Use explicit expense-to-budget references rather than title/category matching: similarly named budgets must not silently claim the same expense. One transaction deducts from one envelope; income is never spending. Budget scope must match the expense.

Use calendar windows with Monday-first weeks and cumulative integer-cent daily partitions. This supports monthly allowances viewed weekly/daily, and weekly allowances viewed monthly, without a fixed four-weeks-per-month assumption or rounding drift. Show both the current view's remaining amount and native-period balance. No carryover is inferred. Dated recurring entries remain planning-ledger values, and future entries are separately identified rather than presented as settled payments.

Project funding traverses contained tasks, not prerequisite links. Count each task's own cost once per rollup and count task IDs once in overall funding totals. Parent task cost is incremental; manual project budgets are not additional costs. Individual multi-membership container rollups can overlap and are labelled accordingly. Confirmed task costs remain in total project funding but leave still-open requirements. Cash-flow transactions and task estimates are never combined into a bank balance.

Routine/block synchronization uses a canonical reference, not copied events. Linked routines inherit the block's occurrence dates and start-plus-offset time while retaining their own schedule for unlinking. This avoids duplicate routine/Calendar records and supports edits from either editor.
