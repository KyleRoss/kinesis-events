# kinesis-events History

## 2.0.0 (5/31/2018)
Version 2.0.0 was refectored to be lighter-weight and more functional. The async method in version 1 was opinionated and not needed.

* **BREAKING:** Removed `parseAsync()` method.
* **BREAKING:** Removed `KinesisEvents` property.
* **BREAKING:** Removed `failed` property.
* **BREAKING:** `parse()` now returns object containing `records`, `failed` and `total`.
* **BREAKING:** `error` event has been renamed to `parseError`.
* **NEW:** Now able to pass in just `events` to `parse()`.
* Removed dependency `async-each`.
* Added dependency `json-parse-better-errors`.
* Misc. cleanup
* Added tests
