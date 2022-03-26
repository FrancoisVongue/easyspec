import {Validate, ValidationOptionsSym, ValidationSpec} from "./index";
import {IsOfType, JSTypesWithArrayAndNull, num, Return, TypeOf} from "fp-way-core";
import Gt = num.Gt;

type CatChild = {
    age?: number;
    name?: string;
    weight?: number;
}
type Cat = {
    age: number;
    name?: string;
    weight: number;
    child?: CatChild
}
type CatParent = {
    age?: number;
    name: string;
    weight: number;
    childCat: Cat;
}

describe('Validate', () => {
    const TypeErrorFactory = (t: JSTypesWithArrayAndNull) => (v, k) => `${k} must be of type ${t} but was of type ${TypeOf(v)}`
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
        child: CatChildSpec,
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
        childCat: CatSpec,
        [ValidationOptionsSym]: {
            optionalProps: ['age']
        }
    }

    it('should return valid summary if an object is valid', () => {
        const catChild: CatChild = {
            age: 1,
            name: 'Tonny',
            weight: 4,
        }

        const result = Validate(CatChildSpec, catChild);

        expect(result.valid).toBe(true);
    })
    it('should return valid summary if an object is invalid', () => {
        const catChild: CatChild = {
            age: 'Tom',
            name: 8,
            weight: { number: 3 },
            isTiger: false
        } as any

        const result = Validate(CatChildSpec, catChild);

        expect(result.valid).toBe(false);
    })
    it('should return number of errors and invalid keys', () => {

        const cat: Cat = {
            age: '1' as any, // str instead of a number
            name: 'Tonny',
            weight: 4,
            child: [] as any // arr instead of an obj
        }

        const result = Validate(CatSpec, cat);

        expect(result.errors.name).toBeUndefined();
        expect(result.errors.weight).toBeUndefined();

        expect(result.errors.age).toBeDefined();
        expect(result.errors['child._self']).toBeDefined();
        expect(result.errorCount).toBe(2);
        expect(result.valid).toBe(false);
    })
    it('should not error optional properties if they were omitted', () => {
        const cat: Cat = {
            age: 1,
            // name: 'Tonny',  <-- optional
            weight: 4,
            child: {},
        }

        const result = Validate(CatSpec, cat);

        expect(result.valid).toBe(true);
    })
    it('should error optional properties if they are present', () => {
        const cat: Cat = {
            age: 1,
            name: 1 as any, // should be string
            weight: 4,
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
            weight: 4,
            child: {},
            // @ts-expect-error
            redProp: 'what', // redundant
        }

        const result = Validate(CatSpec, cat);

        expect(result.redundantProperties?.length).toBeGreaterThan(0);
    })
    it('should validate specs even if they are deeply nested', () => {
        const cat: Cat = {
            // age: 1, missing
            color: 'grey',
            name: 1,
            weight: 4,
            child: {
                name: 'Tonny jr',
                age: '1',
            },
        } as any;

        const catParent: CatParent = {
            age: 'old',
            name: 'Tonny Sr',
            weight: 'overweight',
            childCat: cat
        } as any

        const result = Validate(CatParentSpec, catParent);

        expect(result.errorCount).toBe(6);
        expect(result.valid).toBe(false);
    })
    it('should validate an object in less than 3ms', () => {
        const cat: Cat = {
            age: 1,
            name: 1 as any, // SHOULD BE A STRING
            weight: 4,
            child: {
                name: 'Tonny jr',
                age: '1' as any, // SHOULD BE A NUMBER
            },
        }
        const catParent: CatParent = {
            age: 1,
            name: 'Tonny Sr',
            weight: '4' as any, // SHOULD BE NUMBER
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