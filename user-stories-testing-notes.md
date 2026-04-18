# US-01
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Happy Path:** Run normally.
* **Negative Path (Bug Injection):** Append `?b=r8w5gb2n ` to the starting URL. 
* **Bug Effect:** Bypasses password match validation (allows submission even if passwords differ).
* **Expected Agent Behavior:** Should fail on AC_01 and use `test.fail()`.

# US-02
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Happy Path:** Run normally.
* **Negative Path 1 (Server Crash):** Append `?b=q7m2vn4k` (Simulates a 500 Internal Server Error blank page).
    * *Expected Agent Behavior:* Should fail on AC_03 and use `test.fail()`.
* **Negative Path 2 (Silent Failure):** Append `?b=p3x9ha1t` (Suppresses the 'Invalid credentials' error message completely).
    * *Expected Agent Behavior:* Should fail on AC_03 and use `test.fail()`.


# US-03
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Happy Path:** Run normally.
* **Negative Path (RBAC Leak):** Append `?b=a9u3kd1x` to the starting URL.
    * *Bug Effect:* The 'System Settings' tab incorrectly renders for the regular user.
    * *Expected Agent Behavior:* Should fail on AC_02 and use `test.fail()`.

# US-04
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Bug Injection 1:** `?b=n8r4bf6q` (task_no_validation - allows empty title)
* **Bug Injection 2:** `?b=y1p6ls4v` (toast_missing)

# US-05
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Bug Injection 1:** `?b=t4h9eu5m` (status_toggle_fail)
* **Bug Injection 2:** `?b=f6j2qp9w` (filter_broken)

# US-06
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Bug Injection:** `?b=v1s8yl3c` (modal_wont_close)

# US-07
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Bug Injection 1:** `?b=d5k7mt2z` (delete_btn_missing - missing for everyone)
* **Bug Injection 2:** `?b=c2n7zr8p` (rbac_leak - User sees Delete buttons on Admin's tasks)

# US-08
**[TESTING NOTES - DO NOT PASS TO AGENT]**
* **Bug Injection:** `?b=y1p6ls4v` (toast_missing)