# Should not auto-capture properties

The current behavior when defining object patterns is to auto-capture property references using the properties name. I'm beginning to think this is a bad idea:

- If you define a pattern for a nested structure, then you will get captures for every level of nesting
- I could see this causing some subtle bugs where, for example:
    - The final match does not capture a needed name, but the higher-level structural match does
    - A structural match higher up replaces a lower-level capture of the same name
- It's useful to know what items are being captured because a validation can be performed to make sure the expression returns values needed by the generator

