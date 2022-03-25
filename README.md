# Easyspec
Object validation library that provides `Validate` method.

## Validate
A binary function that takes two arguments:
1. validation specification
2. an object

It **checks whether object adheres to the specification**.
and returns `validation summary`

Validation specification looks like this:
```ts
export type ValidationOptions<T extends DataObject> = {
    // used to increase performance in case you are only interested in 
    // validity of an object and not in all the properties that are invalid
    stopWhen?: (summary: ValidationSummary<T>) => boolean, 
    
    // allows you to create custom messages in case validator throws an exception
    errorHandler?: (e: ValidationException) => string,
    
    // should redundant properties make object invalid (true by default)
    redundantIsError?: boolean,
    
    // properties that are allowed to be null or undefined
    optionalProps?: (keyof T)[],
    
    // whether object itself is allowed to be null or undefined
    isOptional?: boolean
}
export type ValidationPropertyRule<T1> = [
    (v: any, o: T1) => boolean,                 // validator predicate function 
    string | ((v: any, k: keyof T1) => string) // message in case validator returns false
];
export type ValidationSpec<T1 extends DataObject> =
    & Record<keyof T1, ValidationPropertyRule<T1>[] | AnyValidationSpec>
    & { [ValidationOptionsSym]?: ValidationOptions<T1> };
```

<details>
<summary>Click to view example:</summary>

```ts
type CatChild = Partial<Omit<Cat, 'child'>>
type Cat = {
    age: number;
    name?: string;
    amountOfLegs: number;
    child: CatChild
}

type CatParent = {
    age: number;
    name?: string;
    amountOfLegs: number;
    childCat: Cat;
}

const CatChildSpec: obj.ValidationSpec<CatChild> = {
    age: [
        [IsOfType('number'), 'age must be a number']
    ],
    name: [
        [IsOfType('string'),  'name must be a number']
    ],
    amountOfLegs: [
        [IsOfType('number'),  'amountOfLegs must be a number']
    ],
    [ValidationOptionsSym]: {
        optionalProps: ['name', 'age', 'amountOfLegs']
    }
}

const CatSpec: obj.ValidationSpec<Cat> = {
    age: [
        [IsOfType('number'), 'age must be a number']
    ],
    name: [
        [IsOfType('string'),  'name must be a number']
    ],
    amountOfLegs: [
        [IsOfType('number'),  'amountOfLegs must be a number']
    ],
    child: CatChildSpec,
    [ValidationOptionsSym]: {
        optionalProps: ['name']
    }
}


const CatParentSpec: obj.ValidationSpec<CatParent> = {
    age: [
        [IsOfType('number'), 'age must be a number']
    ],
    name: [
        [IsOfType('string'),  'name must be a number']
    ],
    amountOfLegs: [
        [IsOfType('number'),  'amountOfLegs must be a number']
    ],
    childCat: CatSpec,
    [ValidationOptionsSym]: {
        optionalProps: ['name']
    }
}

const cat: Cat = {
    age: 1,
    name: 1 as any, // SHOULD BE A STRING
    amountOfLegs: 4,
    child: {
        name: 'Tonny jr',
        age: '1' as any, // SHOULD BE A NUMBER
    },
}
const catParent: CatParent = {
    age: 1,
    name: 'Tonny Sr',
    amountOfLegs: '4' as any, // SHOULD BE A NUMBER
    childCat: cat
}

const result = Validate(CatParentSpec, catParent);
const Result = {
    "valid": false,
    "errorCount": 3,
    "missingProperties": [],
    "redundantProperties": [],
    "errors": {
        "amountOfLegs": [
            "amountOfLegs must be a number"
        ],
        "childCat.name": [
            "name must be a number"
        ],
        "childCat.child.age": [
            "age must be a number"
        ]
    }
}
```
</details> 
<hr>

Result of the function is of type ValidationSummary:
```ts
export type ValidationSummary<T1 extends DataObject> = {
    // whether object is valid
    valid: boolean,
    
    // how many errors occured in the process of validation
    // in case of a valid object it's always 0
    errorCount: number,
    
    // valid object can not have missing properties
    missingProperties: string[],
    
    // valid object can not have redundant properties 
    // (unless stated otherwise in specification)
    redundantProperties: string[],
    
    // messages to understand what is wrong with the object
    errors: Record<keyof T1 | '_self', string[]>
    // _self is used to indicate that value that you passed to 
    // the validation function IS NOT AN OBJECT AT ALL
}
```

