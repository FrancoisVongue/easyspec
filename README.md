# Easyspec
Object validation library. 
It provides `Validate` method that takes two arguments:
1. ValidationSpec<T>
2. Object of type T

## Validate
A binary function that takes two arguments:
1. validation specification
2. an object

It **checks whether object adheres to the specification**.
and returns `validation summary`

Validation specification looks like this:
```ts
export type ValidationSpec<T1 extends DataObject> = {
    [P in keyof T1]:
        | ValidationSpec<Required<T1>[P]>               // spec for nested obj
        | ValidationPropertyRule<T1, P>[]               // or an array of validationPropertyRules
} & { [ValidationOptionsSym]?: ValidationOptions<T1> }; // optional options

export type ValidationPropertyRule<T1, P extends keyof T1> = [ // tuple of:
    (v: T1[P], k: P, o: T1) => boolean,                // 0.validator 
    (v: T1[P], k: P, o: T1) => string                 // 1.message factory
];
```
## Options 
```ts
export type ValidationOptions<T extends DataObject> = {
    // used to increase performance in case you are only interested in 
    // validity of an object and not in all the properties that are invalid
    stopAfterInvalid?: boolean,

    // allows you to create custom messages in case validator throws an exception
    errorHandler?: (e: ValidationException) => string,

    // should redundant properties make object invalid (true by default)
    redundantIsError?: boolean,

    // properties of an object that are allowed to be null or undefined
    optionalProps?: (keyof T)[],

    // whether object is allowed to be null or undefined
    isOptional?: boolean
}

// errorHandler option input value type looks like this:
export type ValidationException = {
    key: string,       // key that caused error
    value: any,        // value that caused error
    ruleIndex: number, // index of the rule where error occured
    error: Error       // exception itself
}
```

You don't have to provide any of the options, there's a default value for 
every option. Default options look like this:
```ts
const defaultOptions = {
    optionalProps: [],
    redundantIsError: true,
    stopAfterInvalid: false,
    errorHandler: ({key}) => `Error while validating property "${key}".`,
    isOptional: false
}
```

## Validation summary
The result of the `Validate` function is of type `ValidationSummary`
```ts
export type ValidationSummary<T1 extends DataObject> = {
    valid: boolean,                                     // whether object is considered valid
    errorCount: number,                                 // number of errors
    missingProperties: string[],                        // missing properties
    redundantProperties: string[],                      // redundant properties
    errors: Record<keyof T1 | '_self', string[]>        // error messages that occured
}
```

# Examples
## Simple objects
```ts
type CatChild = {
    age?: number;
    name?: string;
    weight?: number;
}

const CatChildSpec: ValidationSpec<CatChild> = {
    age: [
        [   // validator function takes these three parameters
            // NOTE THE TYPES (they can be inferred)
            (v: number, k: 'age', o: CatChild) => typeof v === 'number',
            // message factory function same three parameters
            (value, key, obj) => `${key} must be of type number but was of type ${typeof value}`
        ],
        [   
            (value, key, obj) => value > 0,
            (value, key, obj) => `${key} must be greater than 0 but was ${value}`
        ],
    ],
    name: [
        [
            (value, key, obj) => typeof value === 'string',
            (value, key, obj) => `${key} must be of type string but was of type ${typeof value}`
        ],
    ],
    weight: [
        [
            (value, key, obj) => typeof value === 'number',
            (value, key, obj) => `${key} must be of type number but was of type ${typeof value}`
        ],
    ],
    // to specify options you need to import <ValidationOptionsSym> symbol 
    [ValidationOptionsSym]: {
        // according to the type above all properties should be optional
        optionalProps: ['name', 'age', 'weight'], 
    }
}


const validCatChild: CatChild = {
    age: 1,
    name: 'Tonny',
    weight: 4,
}

const summary = Validate(CatChildSpec, validCatChild);
```
Result will be:
```
{
    "valid": true,
    "errorCount": 0,
    "missingProperties": [],
    "redundantProperties": [],
    "errors": {}
}
```
```ts

const validCatChild: CatChild = {
    age: 1,
    name: 'Tonny',
    // weight: 4,  # because every property is optional you can safely omit any of them
}

const summary = Validate(CatChildSpec, validCatChild); 
```
Result will be:
```
{
    "valid": true,
    "errorCount": 0,
    "missingProperties": [],        # weight is not considered missing because it's optional
    "redundantProperties": [],
    "errors": {}
}
```
**When we pass invalid object:**
```ts
const invalidCatChild: CatChild = {
    age: 'Tom',
    name: 8,
    weight: { number: 3 },
    isTiger: false
}
const summary = Validate(CatChildSpec, invalidCatChild);
```
Result will be:
```
{
  "valid": false,                                               # object is invalid
  "errorCount": 5,                                              # 5 errors were found
  "missingProperties": [],
  "redundantProperties": [
    "isTiger"                                                   # isTiger property is redundant
  ],
  "errors": {                                                   # "errors" is an object that contains 
    "age": [                                                    # an array of errors for every property:
      "age must be of type number but was of type string",
      "age must be greater than 0 but was Tom"
    ],
    "name": [
      "name must be of type string but was of type number"
    ],
    "weight": [
      "weight must be of type number but was of type object"
    ]
  }
}
```

## Reducing amount of code
To reduce the amount of code that you need to write to declare a spec 
you can try using some helper function library such as: 
+ lodash
+ fp-way-core 
+ ramda

For this example I am going to use `fp-way-core`.
Let's declare the same spec as we did above, but now using the lib.

```ts
// create a helper for common functions
const TypeErrorFactory = (t) => (v, k) => `${k} must be of type ${t} but was of type ${TypeOf(v)}`
const CatChildSpec: ValidationSpec<CatChild> = {
    age: [
        [IsOfType('number'), TypeErrorFactory('number')],
        [Gt(0), (v, k) => `${k} must be greater than 0 but was ${v}`],
    ],
    name: [
        [IsOfType('string'), TypeErrorFactory('string')],
    ],
    weight: [
        [IsOfType('number'), TypeErrorFactory('number')],
    ],
    [ValidationOptionsSym]: {
        optionalProps: ['name', 'age', 'weight'],
    }
}
```

## Nested objects and nested specs
```ts
type CatChild = {
    age?: number;
    name?: string;
    weigth?: number;
}

type Cat = {
    age: number;
    name?: string;
    weigth: number;
    child: CatChild  // we are going to apply NESTED SPEC to validate this property
}

type CatParent = {
    age?: number;
    name: string;
    weigth: number;
    childCat: Cat;  // we are going to apply NESTED SPEC to validate this property
}

const CatChildSpec: ValidationSpec<CatChild> = {
    age: [
        [IsOfType('number'), TypeErrorFactory('number')],
        [Gt(0), (v, k) => `${k} must be greater than 0 but was ${v}`],
    ],
    name: [
        [IsOfType('string'),  TypeErrorFactory('string')]
    ],
    weight: [
        [IsOfType('number'),  TypeErrorFactory('number')]
    ],
    [ValidationOptionsSym]: {
        optionalProps: ['name', 'age', 'weight'],
        isOptional: true,
    }
}

const CatSpec: ValidationSpec<Cat> = {
    age: [
        [IsOfType('number'), TypeErrorFactory('number')],
    ],
    name: [
        [IsOfType('string'),  TypeErrorFactory('string')]
    ],
    weight: [
        [IsOfType('number'),  TypeErrorFactory('number')]
    ],
    child: CatChildSpec,        // just pass the SPECIFICATION for the 
                                // nested object instead of an array of validators
    [ValidationOptionsSym]: {   
        optionalProps: ['name']
    }
}

const CatParentSpec: ValidationSpec<CatParent> = {
    age: [
        [IsOfType('number'), TypeErrorFactory('number')],
    ],
    name: [
        [IsOfType('string'),  TypeErrorFactory('string')]
    ],
    weight: [
        [IsOfType('number'),  TypeErrorFactory('number')]
    ],
    childCat: CatSpec,          // just pass the SPECIFICATION for the 
                                // nested object instead of an array of validators
    [ValidationOptionsSym]: {
        optionalProps: ['age']
    }
}

const cat: Cat = {
    // age: 1,              // missing
    color: 'grey',          // redundant
    name: 1,
    weight: 4,
    child: {                // nested child
        name: 'Tonny jr',
        age: '1',
    },
} as any;

const catParent: CatParent = {
    age: 'old',
    name: 'Tonny Sr',
    weight: 'overweight', 
    childCat: cat           // nested cat
} as any

const result = Validate(CatParentSpec, catParent);
```
Result will be:
```
{
  "valid": false,
  "errorCount": 6,
  "missingProperties": [
    "childCat.age"
  ],
  "redundantProperties": [
    "childCat.color"
  ],
  "errors": {
    "age": [
      "age must be of type number but was of type string"
    ],
    "weight": [
      "weight must be of type number but was of type string"
    ],
    "childCat.name": [
      "name must be of type string but was of type number"
    ],
    "childCat.child.age": [
      "age must be of type number but was of type string"
    ]
  }
}
```
**Please note** the way nested object errors are presented. 
They are presented using `dot notation`: *"childCat.child.age"* 

If you want to change format of the message 
you can **try to use function to validate the nested object as usual**:
```ts

const CatSpec: ValidationSpec<Cat> = {
    child: [
        [
            (v, k, o) => v?.age > 0, 
            (v, k, o) => `${k} age must be greater than 0 but was ${v?.age}`
        ]
    ]
}
```

# Extending specs
As you can see above there's quite *a lot of repetition when declaring specs for similar types*.
To only write necessary specification details for different types there's **Extend** method.

Extend method takes two arguments:
1. extension specification
2. parent specification

## Extension specification
Similar to validation specification but:
1. Two options are required: `omitKeys` and `optionalProps`, this is done 
    so that you don't forget to remove properties that don't exist on the new type and 
    rewrite optional properties in accordance to the new type.
2. Only **keys that are NOT present on the parent type are required** .

## Example
```ts
type City      = { area?: number, name: string }
type LocalArea = { area:  number, city: string }

const CitySpec: ValidationSpec<City> = {
    area: [ [IsOfType('number'), TypeErrorFactory('number')] ],
    name: [ [IsOfType('string'), TypeErrorFactory('string')] ],
    [ValidationOptionsSym]: { optionalProps: ['area'] }
}


const LocalAreaSpec = Extend<City, LocalArea>({ // from city -> to -> localArea spec
    // 1. only add properties that don't exist on the parent spec
    city: [ [IsOfType('string'), TypeErrorFactory('string')] ],
    // area propertyRule will be inherited from the parent
    [ValidationOptionsSym]: {
        // 2. omit parent spec properties using omitkeys option
        omitKeys: ['name'],
        
        // 3. override optionalProperties option 
        // (in the parent spec it says that we have optional property 'name' 
        // which is not true for the current spec)
        optionalProps: [],
    }
}, CitySpec);
```
In the example above you can see how to easily add and remove properties from the parent specification.
But you can also:
**Override parent options and property rules:**
```ts
const LocalAreaSpec = Extend<City, LocalArea>({
    // city property is not present on the parent spec, 
    // so it's required that you provide property rules for it
    city: [ [IsOfType('string'), TypeErrorFactory('string')] ],
    // 1. area property rule will be completely overriden
    // 2. area property is present on the parent so overriding it is optional
    area: [ 
        [IsOfType('number'), TypeErrorFactory('number')],
        [Gt(0), (v, k) => `${k} must be greater than 0 but was ${v}`],
    ],
    [ValidationOptionsSym]: {
        // these options are required when extending
        omitKeys: ['name'],
        optionalProps: [],
        
        // you can specify more options to substitute those on the parent options object
        // these options are optional when extending
        redundantIsError: true,
        stopAfterInvalid: false,
        errorHandler: ({key, ruleIndex}) => `Error while validating property "${key}" at rule index ${ruleIndex}`,
        isOptional: false
    }
}, CitySpec);
```

# Speed comparison
🔨 to be continued...