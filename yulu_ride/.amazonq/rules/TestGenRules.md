- For testing, no need to insert dummy data first in database through setup scripts or in tests itself, developer would input data manually in tests based on real db entries, add placeholders of entring data in tests.

- In Integration tests, if any test perform any db insertion or some other db operations, in end db state should be same as before test execution, database should be consistent. Write test cases accordingly to ensure it.

- In unit tests, ensure testing of each connected units, if one api is dependent on several units, then ensure testing of all units explicitly.

- In Unit tests, ensure each unit is tested accurately. Avoid using unncessary mocks everywhere, use only when it is necessary.

- Take directory structure always same as following :
    - tests 
        - unit
        - integration



