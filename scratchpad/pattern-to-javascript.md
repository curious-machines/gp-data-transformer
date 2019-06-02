=~ any

function a($) {
	return {};
}

---

=~ boolean

function a($) {
	return typeof $ === "boolean" ? {} : FAILURE_VALUE;
}

---

=~ true

function a($) {
	return $ === true ? {} : FAILURE_VALUE;
}

---

=~ false

function a($) {
	return $ === false ? {} : FAILURE_VALUE;
}

---

=~ number

function a($) {
	return typeof $ === "number" ? {} : FAILURE_VALUE;
}

---

=~ 10

function a($) {
	return $ === 10 ? {} : FAILURE_VALUE;
}

---

=~ array
=~ []

function a($) {
	return Array.isArray($) ? {} : FAILURE_VALUE;
}

---

=~ object
=~ {}

function a($) {
	return $ !== null && typeof $ === "object" ? {} : FAILURE_VALUE;
}

---

=~ null

function a($) {
	return $ === null ? {} : FAILURE_VALUE;
}

---

=~ undefined

function a($) {
	return $ === undefined ? {} : FAILURE_VALUE;
}

---

=~ [1, 2, 3]

function a($) {
	if ($.length === 3) {
		if ($[0] === 1 && $[1] === 2 && $[2] === 3) {
			return {};
		}
	}

	return false;
}

---

=~ { a: 1, b: 2, c: 3 }

function a($) {
	if (["a", "b", "c"].every(p => p in $)) {
		if ($.a === 1 && $.b === 2 && $.c === 3) {
			return {};
		}
	}

	return false;
}

---

=~ { a: 1 as one, b: 2 as two, c: 3 as three }

function a($) {
	if (["a", "b", "c"].every(p => p in $)) {
		if ($.a === 1 && $.b === 2 && $.c === 3) {
			return {
				"one": $.a,
				"two": $.b,
				"three": $.c
			};
		}
	}

	return false;
}

---

```
10 |> 2
```

```
function main($) {
    function a1($) {
        return 10;
    }
    function a2($) {
        return 2;
    }
    
    $ = a1($);
    $ = a2($);
    
    return $;
}
```
