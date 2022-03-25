// == VALIDATOR
import {DataObject, Exists, FALSE, IsOfType, obj} from "fp-way-core";

namespace _ValidationSummary {
    export const incErrCount = (s: ValidationSummary<any>) => {
        s.errorCount++
        s.valid = false
    }
    export const addErr = (k: string, msg: string, summary: ValidationSummary<any>) => {
        if(IsOfType('array', summary.errors[k])) {
            (summary.errors[k]).push(msg);
        } else {
            summary.errors[k] = [msg];
        }
        incErrCount(summary);
    }
    export const New = <T1>(): ValidationSummary<T1> => {
        return {
            valid: true,
            errorCount: 0,
            missingProperties: [],
            redundantProperties: [],
            errors: {} as Record<keyof T1 | '_self', string[]>
        }
    }
    export const mergeNestedSummary = (
        summary: ValidationSummary<any>,
        key: string,
        nestedSummary: ValidationSummary<any>,
    ) => {
        const prependKey = (v: string) => `${key}.${v}`

        summary.valid = nestedSummary.valid && summary.valid;
        summary.errorCount += nestedSummary.errorCount;
        summary.missingProperties.push(...nestedSummary.missingProperties.map(prependKey));
        summary.redundantProperties.push(...nestedSummary.redundantProperties.map(prependKey));

        const nestedErrors: [any, any][] = obj.Entries(nestedSummary.errors)
            .map(([nestedKey, v]) => [prependKey(nestedKey), v])

        summary.errors = obj.FromEntries([
            ...obj.Entries(summary.errors),
            ...nestedErrors
        ])
    }
}
export type ValidationSummary<T1 extends DataObject> = {
    valid: boolean,
    errorCount: number,
    missingProperties: string[],
    redundantProperties: string[],
    errors: Record<keyof T1 | '_self', string[]>
}
export type ValidationException = {
    key: string,
    value: any,
    ruleIndex: number,
    error: Error
}
export type ValidationOptions<T extends DataObject> = {
    stopWhen?: (summary: ValidationSummary<T>) => boolean,
    errorHandler?: (e: ValidationException) => string,
    redundantIsError?: boolean,
    optionalProps?: (keyof T)[],
    isOptional?: boolean
}
export type OptionalObjectValidationOptions<T extends DataObject> =
    Omit<ValidationOptions<T>, 'isOptional'> & {isOptional: true}
export type PopulatedValidationOptions<T1 extends DataObject> = Required<ValidationOptions<T1>>;
export const ValidationOptionsSym: unique symbol = Symbol.for('fp-way-validation-options');
const _defaultValidationOptions: PopulatedValidationOptions<any> = {
    optionalProps: [],
    redundantIsError: true,
    stopWhen: FALSE,
    errorHandler: ({key}) => `Error while validating property "${key}".`,
    isOptional: false
}
export type ValidationPropertyRule<T1, P extends keyof T1> = [
    (v: T1[P], k: keyof T1, o: T1) => boolean,
    (v: T1[P], k: keyof T1, o: T1) => string
];
export type ValidationSpec<T1 extends DataObject> = {
    [P in keyof Required<T1>]?:
    | ValidationSpec<Required<T1>[P]>
    | ValidationPropertyRule<T1, P>[]
} & { [ValidationOptionsSym]?: ValidationOptions<T1> };

export type ValidationSpecWithPopulatedOptions<T1 extends DataObject> =
    & ValidationSpec<T1>
    & { [ValidationOptionsSym]: PopulatedValidationOptions<T1> };
export type OptionalObjectValidationSpec<T1 extends DataObject> =
    & ValidationSpec<T1>
    & { [ValidationOptionsSym]: OptionalObjectValidationOptions<T1> };
export type _CheckPropsResult = {
    missing: string[],
    redundant: string[],
    propsToCheck: string[],
}
export const _validationPreCheckProps = <T1 extends DataObject>(
    spec: ValidationSpecWithPopulatedOptions<T1>,
    o: T1
): _CheckPropsResult => {
    const declaredPropsToCheck = obj.Keys(spec);
    const optionalProps = spec[ValidationOptionsSym].optionalProps;
    const requiredProps = declaredPropsToCheck.filter(d => !optionalProps.includes(d));

    const presentProps = obj.Entries(o)
        .filter(([k, v]) => Exists(v))
        .map(([k, v]) => k);

    const missingRequiredProps = requiredProps.filter(r => !presentProps.includes(r));
    const redundantProps = presentProps.filter(p => !declaredPropsToCheck.includes(p));
    const propsToCheck = presentProps.filter(p => declaredPropsToCheck.includes(p));

    return {
        missing: missingRequiredProps,
        propsToCheck: propsToCheck,
        redundant: redundantProps,
    }
}

export const Validate = <T1 extends DataObject>(
    spec: ValidationSpec<T1>,
    o: T1
): ValidationSummary<T1> => {
    const options: PopulatedValidationOptions<T1> = obj.WithDefault(
        _defaultValidationOptions as any,
        spec[ValidationOptionsSym] ?? {}
    );
    const populatedSpec = (spec[ValidationOptionsSym] = options, spec) as ValidationSpecWithPopulatedOptions<T1>

    const summary: ValidationSummary<T1> = _ValidationSummary.New<T1>();

    if(!IsOfType("object", o)) {
        if(!options.isOptional || Exists(o)) {
            _ValidationSummary.addErr('_self', 'Value must be an object', summary)
        }
        return summary;
    }

    const { propsToCheck, missing, redundant } =
        _validationPreCheckProps(populatedSpec, o);

    if(missing.length) {
        _ValidationSummary.incErrCount(summary);
        summary.missingProperties = missing;
    }
    if(redundant.length) {
        summary.redundantProperties = redundant;
        if(options.redundantIsError) {
            _ValidationSummary.incErrCount(summary);
        }
    }

    for(let i = 0; i < propsToCheck.length; i++) {
        if(options.stopWhen(summary)) { return summary; }

        const ptc = propsToCheck[i];
        const keySpec = spec[ptc as keyof T1];
        const value = o[ptc];

        if(IsOfType('array', keySpec)) {
            for(const rule of keySpec as ValidationPropertyRule<any, any>[]) {
                const [validator, msgFactory] = rule;

                try {
                    const rulePass = validator(value, ptc, o);
                    if(!rulePass) {
                        const message: string = msgFactory(value, ptc, o);
                        _ValidationSummary.addErr(ptc, message, summary);
                    }
                } catch(e){
                    const message = options.errorHandler({key: ptc, value, ruleIndex: i, error: e})
                    _ValidationSummary.addErr(ptc, message, summary)
                }
            }
        } else {
            const nestedSummary = Validate(keySpec as ValidationSpec<T1>, value)
            _ValidationSummary.mergeNestedSummary(summary, ptc, nestedSummary)
        }
    }

    return summary;
}
