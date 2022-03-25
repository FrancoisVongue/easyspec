import {OptionalObjectValidationSpec, Validate, ValidationOptionsSym, ValidationSpec} from "./index";
import {IsOfType, obj, Return} from "fp-way-core";

type CatParent = {
    age: number;
    name?: string;
    amountOfLegs: number;
    childCat: Cat;
}
type Cat = {
    age: number;
    name?: string;
    amountOfLegs: number;
    child?: CatChild
}
type CatChild = Partial<Omit<Cat, 'child'>>

describe('Validate', () => {
    const CatChildSpec: OptionalObjectValidationSpec<CatChild> = {
        age: [
            [IsOfType('number'), Return('age must be a number')]
        ],
        name: [
            [IsOfType('string'),  Return('name must be a number')]
        ],
        amountOfLegs: [
            [IsOfType('number'),  Return('amountOfLegs must be a number')]
        ],
        [ValidationOptionsSym]: {
            optionalProps: ['name', 'age', 'amountOfLegs'],
            isOptional: true
        }
    }

    const CatSpec: ValidationSpec<Cat> = {
        age: [
            [IsOfType('number'), Return('age must be a number')]
        ],
        name: [
            [IsOfType('string'),  Return('name must be a number')]
        ],
        amountOfLegs: [
            [IsOfType('number'),  Return('amountOfLegs must be a number')]
        ],
        child: CatChildSpec,
        [ValidationOptionsSym]: {
            optionalProps: ['name']
        }
    }

    const CatParentSpec: ValidationSpec<CatParent> = {
        age: [
            [IsOfType('number'), Return('age must be a number')]
        ],
        name: [
            [IsOfType('string'),  Return('name must be a number')]
        ],
        amountOfLegs: [
            [IsOfType('number'),  Return('amountOfLegs must be a number')]
        ],
        childCat: CatSpec,
        [ValidationOptionsSym]: {
            optionalProps: ['name']
        }
    }

    it('should return valid summary if an object is valid', () => {
        const cat: Cat = {
            age: 1,
            name: 'Tonny',
            amountOfLegs: 4,
            child: {}
        }

        const result = Validate(CatSpec, cat);

        expect(result.valid).toBe(true);
    })
    it('should return valid summary if an object is invalid', () => {

        const cat: Cat = {
            age: '1' as any, // str instead of a number
            name: 'Tonny',
            amountOfLegs: 4,
            child: [] as any // arr instead of an obj
        }

        const result = Validate(CatSpec, cat);

        expect(result.valid).toBe(false);
    })
    it('should return number of errors and invalid keys', () => {

        const cat: Cat = {
            age: '1' as any, // str instead of a number
            name: 'Tonny',
            amountOfLegs: 4,
            child: [] as any // arr instead of an obj
        }

        const result = Validate(CatSpec, cat);

        expect(result.errors.name).toBeUndefined();
        expect(result.errors.amountOfLegs).toBeUndefined();

        expect(result.errors.age).toBeDefined();
        expect(result.errors['child._self']).toBeDefined();
        expect(result.errorCount).toBe(2);
        expect(result.valid).toBe(false);
    })
    it('should not error optional properties if they were omitted', () => {
        const cat: Cat = {
            age: 1,
            // name: 'Tonny',  <-- optional
            amountOfLegs: 4,
            child: {},
        }

        const result = Validate(CatSpec, cat);

        expect(result.valid).toBe(true);
    })
    it('should error optional properties if they are present', () => {
        const cat: Cat = {
            age: 1,
            name: 1 as any, // should be string
            amountOfLegs: 4,
            child: {},
        }

        const result = Validate(CatSpec, cat);

        expect(result.valid).toBe(false);
        expect(result.errors.name).toBeDefined();
    })
    it('should error redundant properties by default', () => {
        const cat: Cat = {
            age: 1,
            name: 'Tonny',
            amountOfLegs: 4,
            child: {},
            // @ts-expect-error
            redProp: 'what', // redundant
        }

        const result = Validate(CatSpec, cat);

        expect(result.redundantProperties?.length).toBeGreaterThan(0);
    })
    it('should validate specs even if they are deeply nested', () => {
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
            amountOfLegs: '4' as any, // SHOULD BE NUMBER
            childCat: cat
        }

        const result = Validate(CatParentSpec, catParent);

        expect(result.errorCount).toBe(3);
        expect(result.valid).toBe(false);
    })
    it('should validate an object in less than 3ms', () => {
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
            amountOfLegs: '4' as any, // SHOULD BE NUMBER
            childCat: cat
        }

        const ITERATIONS = 100;

        const start = process.hrtime();
        for(let i = 0; i < ITERATIONS; i++) {
            Validate(CatParentSpec, catParent);
        }
        const [_, ms6] = process.hrtime(start);
        const ms = ms6 / 10**6 / ITERATIONS

        console.log(`Validation time: ${ms} milliseconds`);

        expect(ms).toBeLessThan(3);
    })
})