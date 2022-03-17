# FP-WAY
Simple functional programming library that works as you would expect.
> **Main purpose of the library is to**
> **reduce the amount of code that you need to write in your projects.**
> <br>and make it much more **readable**

# Type based structure
Library consists of **[core methods](#core-methods)** and namespaces that correspond to the following javascript types:

| namespace | javascript type | documentation link |
|-----------|:----------------|--------------------|
| bool      | boolean         | **[bool](#bool)**  | 
| num       | number          | **[num](#num)**    | 
| str       | string          | **[str](#str)**    | 
| obj       | object          | **[obj](#obj)**    | 
| arr       | array           | **[arr](#arr)**    | 


Each namespace contains curried methods that work on the corresponding type.

# Core methods


| Base fp methods                           | Conditionals                            | Other                   |
|-------------------------------------------|-----------------------------------------|-------------------------|
| [Curry](#curry)                           | [Is](#is)                               | [DoNothing](#donothing) |
| [Identity](#identity)                     | [Exists](#exists)                       | [TypeOf](#typeof)       |
| [Const](#const-aka-return-true-and-false) | [IfElse](#ifelse)                       |                         |
| [Variable](#variable)                     | [When](#when)                           |                         |
| [Swap](#swap)                             | [Unless](#unless)                       |                         |
| [Call](#call)                             | [InCase](#incase)                       |                         |
| [ApplyOn](#applyon)                       | [IndependentInCase](#independentincase) |                         |
| [Pipe](#pipe)                             | [CanBeDescribedAs](#canbedescribedas)   |                         |
| [Compose](#compose)                       | [IsEither](#iseither)                   |                         |
| [Not](#not)                               | [IsOfType](#isoftype)                   |                         |

Note that some methods in this section have **aliases**. 
<br>For example **Const** and **Return** are the same method.

## Curry
Returns a curried version of a function. 
<br>
Returned function returns itself if there were no arguments passed.
<br>It may take not only one but **multiple arguments at a time**.
```ts
const add = (a, b) => a + b;

const curriedAdd = Curry(add);
const add2 = curriedAdd(2);     // returns (x) => 2 + x
const four = curriedAdd(2, 2);  // pass 2 args at a time
```

## Identity
Function that returns first argument passed to it
```ts
const Identity = x => x
```

## Const (aka Return), TRUE and FALSE
Const(Return) is a function that takes **two arguments** and returns the first one.
<br>**TRUE** and **FALSE** are aliases for Const(true) and Const(false) respectively.

Useful to use as a higher order function to return the same value no matter the input.
```ts
const Const = (a, b) => a
```
> **Note** that function examples in this tutorial just show function signatures.
> Actual functions in the library are **curried**. 

## Variable
Variable is a function that takes **two arguments** and returns the **second** one.

## DoNothing
Function that optionally takes a single argument and does nothing.
(in js terms that means it `returns undefined`).

## Not
Takes a predicate (a function that returns **boolean**) and returns a predicate <br>
that **returns true/false in opposite to the initial function cases**.

> **Note** that this function is one of a few that are **not curried**.

## Is
Function that takes two arguments and checks if they are equal using **strict equality**.

## IsNot
```ts
const IsNot = Not(Is)
```

## Exists
Function that takes a single argument and checks if it's equal to **null** or **undefined**
<br> using strict equality. Any other value is considered as existing.

## NotExists
```ts
const NotExists = Not(Exists);
```

## Swap
Function that takes a **binary function** and returns a binary function that
<br>does the same thing but **takes second argument first**.
```ts
const append = (appendingString, str) => str + appendingString;
const result1 = append('Hello ', 'world'); // "worldHello "

const prepend = Swap(append);
const result2 = prepend('Hello ', 'world'); // "Hello world"
```

## Call
Function that takes a function and an argument and returns 
<br>**the result of calling that function with the argument**
```ts
const Call = (f, x) => f(x)
```

## ApplyOn
```ts
const ApplyOn = Swap(Call)
```

## IfElse
Function that takes four arguments:
1. unary predicate
2. unary function
3. unary function
4. value

First, value is being passed to the predicate, if it returns 
1. **true** then the function will return the result of calling the first function with the value
2. **false** then the function will return the result of calling the **second function** with the value

## When
Function that takes three arguments:
1. unary predicate
2. unary function
3. value

First, value is being passed to the predicate, if it returns
1. **true** then the function will return the result of calling the function with the value
2. **false** then the function will return the value itself

## Unless
Function that takes three arguments:
1. unary predicate
2. unary function
3. value

First, value is being passed to the predicate, if it returns
1. **true** then the function will return the value itself
2. **false** then the function will return the result of calling the function with the value

## InCase
Function that takes two arguments:
1. An array of binary tuples where every tuple contains:
   1. Unary predicate
   2. Unary function
2. value

Value is passed to every unary predicate in order.
<br>Function returns the result of passing value to the Unary function 
<br>of the first tuple where predicate returns true.

This function works similar to switch...case construction.
```ts
const value = 22;

const FORTY_FOUR = InCase([
    [Is(2) , (v) => v - 2],
    [Is(22), (v) => v * 2],  // first tuple where predicate returns true for the value
                             // value is multiplied by 2 and returned
    // using TRUE as the predicate for the last tuple is simmilar to using "default" in a switch case
    [TRUE  , Return(8)],     
], value)
```

## IndependentInCase
Function that takes two arguments:
1. An array of binary tuples where every tuple contains:
    1. Unary predicate
    2. Unary function
2. value

Works similar to InCase but returns 
<br>**an array of results** of passing value to unary functions where predicate returned `true`

## CanBeDescribedAs
Function takes two arguments:
1. An array of unary predicates
2. value

Checks if every predicate returns true when called with the value.

## IsEither
Function takes two arguments:
1. An array of unary predicates
2. value

Checks if **at least one** predicate returns true when called with the value.

## Pipe
Function takes two arguments:
1. An array of unary functions 
2. value

Passes value to the first function and then the result to the next one, 
<br>invoking every function in order and returning the result of the last one

```ts
const Add = a => b => a + b;
const MultiplyBy = a => b => a * b;

const twelve = Pipe([
    Add(2),
    MultiplyBy(3),
], 2)
```

## Compose
Function takes two arguments:
1. An array of unary functions
2. value

Works similar to `Pipe` but **calls functions in the reverse order**.

## IsOfType
Function takes two arguments:
1. string representing a type, which can be
   `| "undefined"
    | "null"
    | "object"
    | "boolean" `<br>`
    | "number"
    | "bigint"
    | "string"
    | "symbol"
    | "function"
    | "array" |`
3. a value

Validates that value is of specified type. Works similar to `typeof` 
but works correctly for **null** and **array** values.

## TypeOf
Unary function that takes value and returns its type, 
<br>which can be one of the aforementioned strings.

# Bool
## IsBool
Unary predicate that takes one argument returns true if argument is either true or false.

## And
Binary predicate that takes two boolean arguments and returns true if both of them are true.
```ts
const And = (a, b) => a && b
```

## Or
Binary predicate that takes two boolean arguments and returns true if either of them is true.

## Not
Unary predicate that takes one argument returns true if argument is false.

# Num 
## IsNum
Unary predicate that returns true if argument is of type number.

## IsQuotientOf
Binary predicate that returns true if second argument can be divided by the first without remainder.

```ts
const IsQuotientOf = (a, b) => b % a === 0

const True = IsQuotientOf(13, 39)
```

## IsInt
Unary predicate that returns true if argument is integer.

## IsNaN
Unary predicate that returns true if argument is NaN.

## Gt, Gte, Lt, Lte
Binary predicate that compares first argument to the second one.
1. Gt - greater than
2. Gte - greater than or equal
2. Lt - less than 
2. Lte - less than or equal

```ts
const True = Gt(2, 3); // three is greater than 2 
```

## IsPos, IsNeg
Unary predicate that returns true if argument is greater than 0 (IsPos) or less than 0 (IsNeg)

## InRangeEx
Function takes three numeric arguments:
1. min
2. max
3. value

And returns true if value is greater than min and less than max.

## InRangeInc
Same as above but **value can also be equal** to the min or max.

## Negate
Unary function that negates a numeric value

## Inc, Dec
Increment (+1) and decrement (-1)

## AtMost
Binary function takes two arguments:
1. max
2. value

And returns max if value is greater than max and value if it's not
```ts
const AtMost = (max, x) => x > max ? max : x
```

## AtLeast
Binary function takes two arguments:
1. min
2. value

And returns min if value is less than min and value if it's not

## Add, Subtr, MulBy, DivBy, Mod
Binary functions that correspond to math operators (+, -, *, /, %)

## Diff
Binary function that returns difference between two numeric values as 
**absolute(positive) value**

## Floor
Unary function that rounds a value to the largest integer less than or equal to the value.

## Ceil
Unary function that rounds a value to the smallest integer greater than or equal to the value.

## ToInt
Unary function that removes decimal part of a number

## Abs
Returns positive representation of a number

## ToExtent
Function takes two arguments: 
1. extent
2. value

And returns value raised to the extent
```ts
const ToExtent = (e, x) => x**e;
```

# Str
## ToUpperCase, ToLowerCase
Unary function that turns a string into it's upper/lowercase version.

## Trim, TrimLeft, TrimRight
Unary function that removes whitespaces from a string on **both** sides or **left** side or **right** side respectively.

## CharAt
Unary function that takes an index(integer) and a string and returns 
a character at the index.

## CharCodeAt
Unary function that takes an index(integer) and a string and returns
a number in range 0 - 2^16 that represents UTF-16 code.

## Slice
Function that takes three arguments:
1. start
2. end
3. value

Extracts a section of the value and returns it as a new string. 
<br>Start and end are integers and can be negative.

## SplitBy
Binary function that takes two arguments
1. splitter
2. value

The split() method divides a String into an ordered list of substrings, 
<br>puts these substrings into an array, and returns the array.  
<br>The division is done by searching for a pattern; where the pattern is provided 
<br>as the first parameter in the method's call and can be **either Regex or a string**.

## ConcatWith
Function takes two string arguments and returns the result of appending first argument to the second one.
```ts
const ConcatWith = (s1, s2) => s2 + s1; // note that s2 comes first
```

## OccurrencesOf
Function takes two arguments:
1. regex 
2. value

Returns an array of substrings of the value string that matched the regex.

## Matches
Binary predicate that takes a Regex and a string and returns true if 
string matches the regex.

## IsOfLength
Binary predicate that takes a number and a string and returns true if 
string length equals to the first argument.

## StartsWith, EndsWith
Binary predicate that takes two strings and returns true if 
second string starts/ends with the first one.

# Obj
## Keys 
Unary function that returns enumerable keys of an object.

## Entries
Unary function that returns enumerable key-value pairs of an object as an array of binary tuples.

## FromEntries
Unary function that takes an array of binary tuples where first values is a string 
and returns an object created using these entries.

For every tuple, first value (string) becomes an object key and second value becomes 
this key's value.

## DeepCopy
Unary function that returns a deep copy of an object, meaning that changing the result 
won't change the object that you passed to the function as argument.

## WithDefault
Binary function that takes two arguments:
1. defaultObject
2. object

It returns a deep copy of the result of merging these two objects into one, with the 
<br>**properties of the second having higher precedence**.
> **Note** If both objects have a nested object under the same key, the objects merge as well

<details>
<summary>Click to view example:</summary>

```ts
const defaultCat = {
    name: 'Jonny',
    age: 1,
    cute: true,
    parent: {
        name: 'Jonny Jr',
        age: 5,
    }
};
const cat = {
    name: 'Malcolm',
    parent: {
        name: 'Malcolm Jr',
        cute: false
    }
}

const result = WithDefault(defaultCat, cat);

const ResultWillBe = {
    name: 'Malcolm',       // overriden by cat
    age: 1,                // taken from default
    cute: true,            // taken from default
    parent: {
        cute: false,       // taken from cat
        name: 'Malcolm Jr',// overriden by cat
        age: 5,            // taken from default
    }
}
```
</details>
<hr>

## Impose
```ts
const Impose = Swap(WithDefault)
```

First object's properties become more important.

## Pick
Binary function that takes two arguments:
1. array of strings 
2. object

Creates a new object with only the keys specified in the first argument.

## Exclude
Same as pick but excludes properties from object instead of picking them.

## Map
A binary function that takes two arguments: 
1. map specification
2. source object

It **maps one object(type) to another**.

Map specification looks like this:
```ts
export type ObjectMapper<T1> = (value: any, obj: T1) => any;
export type ObjectMapSpec<T1, T2> = {
    map: 
        [
            keyof T1 | '', 
            ObjectMapper<T1> | ObjectMapSpec<any, any>, 
            keyof T2
        ][];
    transfer?: Extract<keyof T1, keyof T2>[],
    allowNull?: boolean
}
```
What these specification properties mean: 
1. **map**<br>
    is an array of **ternary tuples** that look like this:
    + key of the source object or an **empty string** in case you want to create **a new key in the resulting object** 
        <br> as opposed to mapping source key to a target one.
    + objectMapper is a binary function to map one key to another or **another map specification to map one object to another** 
        <br>In case it's a function, it takes two arguments: 
        + value of the source key or **null if source key is an empty string**
        + source object
    + key of the target object

2. **transfer**<br>
    an array of keys that have the same name in the target object should be mapped using `Identity` function,
    meaning their value should not change.
3. **allowNull** <br>
    specifies whether this specification is able to handle null value as an object (by default it doesn't),
    for this to work, every object mapper function must handle case where both value and object are null and 
    **every nested map specification must also allow null value**
   
<details>
<summary>Click to view example:</summary>

```ts
interface Cat {
    name: string,
    age: number,
    cute: boolean,
    weight: number,
    kitten: Omit<Cat, 'kitten'>,
}

interface Dog {
    name: string,
    age: number,
    brave: boolean,
    weight: number,
    puppy: Omit<Dog, 'puppy'>,
}

const KittenToPuppySpecification: ObjectMapSpec<Cat, Dog> = {
    transfer: ['age', 'name'],
    map: [
        ['', (_, kitten) => kitten.cute, 'brave'], // one way of making a dog brave in case cat was cute
        ['weight', (weight, kitten) => weight * 2, 'weight'],
    ],
    allowNull: false
}
const CatToDogSpecification: ObjectMapSpec<Cat, Dog> = {
    transfer: ['age', 'name'],
    map: [
        ['cute', Identity, 'brave'], // another way of making a dog brave in case cat was cute
        
        // note that specification can be passed here because kitten and puppy are objects
        ['kitten', KittenToPuppySpecification, 'puppy'],
        ['weight', (weight, kitten) => weight * 3, 'weight'],
    ],
    allowNull: false
}

const cat: Cat = {
    name: 'Marry',
    age: 12,
    cute: true,
    weight: 3.5,
    kitten: {
        name: 'Jerry',
        age: 4,
        weight: 1.5,
        cute: true,
    }
}
const dog = Map(CatToDogSpecification, cat);
const DogResult = {
    name: 'Marry',  // transferred as it was
    age: 12,        // transferred as it was
    brave: true,    // because cat was cute
    weight: 11.5,   // cat weight (3.5) * 3
    kitten: {
        name: 'Jerry',  // transferred from cat.kitten
        age: 4,         // transferred from cat.kitten
        weight: 3,      // kitten weight (1.5) * 2
        brave: true,    // because kitten was cute
    }
}
```
</details> 
<hr>

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

# Arr
| constructors            | transformators                                 | validators                          |
|-------------------------|:-----------------------------------------------|-------------------------------------|
| [OfValues](#ofvalues)   | [Select](#select)                              | [IsArray](#isarray)                 | 
| [OfLength](#oflength)   | [Exclude](#exclude)                            | [AllElementsAre](#allelementsare)   | 
| [FromRange](#fromrange) | [Reduce](#reduce)                              | [SomeElementsAre](#someelementsare) | 
|                         | [Map](#map-1)                                  | [NoElementIs](#noelementis)         | 
|                         | [ConcatTo](#concatto)                          | [ContainedIn](#containedin)         | 
|                         | [Nose, Tail](#nose-tail)                       | [Contains](#contains)               | 
|                         | [Head, Butt](#head-butt)                       | [IsSupersetOf](#issupersetof)       | 
|                         | [TakeNFirst, TakeNLast](#takenfirst-takenlast) | [IsSubsetOf](#issubsetof)           | 
|                         | [Append, Prepend](#append-prepend)             | [EqualsArray](#equalsarray)         | 
|                         | [Flatten](#flatten)                            | [IsUnique](#isunique)               | 
|                         | [Intersection](#intersection)                  |                                     | 
|                         | [Subtract](#subtract)                          |                                     | 

## OfValues
Function that takes multiple arguments of the same type and returns an array of them.
```ts
export const OfValues = <T>(...v: T[]) => [...v];
```

## OfLength
Unary function.
Creates an array of specified length filled with `null`'s.
```ts
const OfLength = (n: number) => Array(n).fill(null)
```

## FromRange
Takes three arguments:
1. start
2. finish (must be greater than start)
3. step (must be integer)

And creates an array of numbers, starting from start up step by step until finish.
```ts
const result = arr.FromRange(1.5, 3.6, 1);
const Result = [1.5, 2.5, 3.5, 3.6]
```

## Select
Binary function that takes a predicate and an array. 
Alternative to Array.prototype.filter.

## Exclude
Binary function that takes a predicate and an array. 
Alternative to Array.prototype.filter but excludes values for which predicate returns true.

## Reduce
Ternary function that takes 
1. ternary function that takes
   1. accumulator
   2. array value
   3. array
2. accumulator
3. array

Alternative to Array.prototype.reduce.

## Map
Binary function that takes a mapper function and an array. 
Alternative to Array.prototype.map.

## ConcatTo
Binary function that takes two arrays and returns a new one that is result of `pushing`
all elements of the first array to the second one.

## Nose, tail
Unary function that returns a new array that contains all elements of the input array but 
the last/first one. In case of an empty array input returns `empty array` as well.

## Head, Butt
Unary function that returns first/last element of an array.
Doesn't change the array itself. In case of an empty array returns `undefined`.

## TakeNFirst, TakeNLast
Binary function that takes a number and an array and returns a new 
array that contains first/last N values of the original array.

## Append, Prepend
Binary function that takes two arguments: a value and an array and returns a 
`new array` that has value appended/prepended to it.

## Flatten
Turns an array that contains nested arrays into a flat array (array that doesn't contain array, only values).
```ts
const groupedArr = [
    [1, 2],
    [3, [4, 5]]
];
const numArr = arr.Flatten(groupedArr)

const Result = [1,2,3,4,5];
```

## Intersection
Binary function that takes two arrays and returns a new array 
that contains only elements that belong to both arrays simultaneously.

## Subtract
Binary function that takes two arrays and returns a new array 
that contains only elements that are contained in the second array and not in 
the first one.

Example:

```ts
// curried example
const remove1and2 = arr.Subtract([1,2]); // returns a function
const arr = [0,1,2,3,4];

const result = remove1and2(arr);
const Result = [0,3,4];
```

## IsArray
Unary predicate that takes a value and returns true if value is an array.

## AllElementsAre
Binary predicate that takes an array and a unary predicate and returns true
if predicate returns true for every element in the array.
Alternative to `Array.prototype.every`.

## SomeElementsAre
Binary predicate that takes an array and a unary predicate and returns true
if predicate returns true for at least one element in the array.
Alternative to `Array.prototype.some`.

## NoElementIs
Binary predicate that takes an array and a unary predicate and returns true
if predicate returns false for every element in the array.

## ContainedIn
Binary predicate that takes two arguments: an array and a value 
and returns true if array contains the value.

## Contains
```ts
const Contains = Swap(ContainedIn);
```

## IsSupersetOf
Binary predicate that takes two arrays and returns true if all elements of 
the first array can be found in the second one.

## IsSubsetOf
```ts
const IsSubsetOf = Swap(IsSupersetOf);
```

## EqualsArray
Binary predicate that takes two arrays and returns true if arrays 
contain the same values. Order doesn't matter.

## IsUnique
Unary predicate that takes an array and returns true if every element of the array is unique.
