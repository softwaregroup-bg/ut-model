import joi from 'joi'
import {Schema, PropertyEditor, Cards, Layouts, Action, Properties} from 'ut-front-devextreme/core/types';
import {Props as Report} from 'ut-front-devextreme/core/Report/Report.types';
import {handlerSet, libFactory, validationOrLib} from 'ut-run';
import type {pageSet} from 'ut-portal/handlers';

export type model<
    Subject extends string,
    Object extends string,
    ResultSet extends string = Object
> = (joi: {joi: joi.Root}) => modelObject<Subject, Object, ResultSet>;
export type editor = Readonly<PropertyEditor>
export type properties = Properties

type fetch<Object extends string> = (params: {
    orderBy: {
        field: string;
        dir: 'ASC' | 'DESC'
    }[],
    paging: {
        pageSize: number;
        pageNumber: number;
    }
} & Record<Object, any>) => object;

type get<Object extends string> = (params: Record<Object, any>) => object;

interface Create extends Omit<Action, 'action'> {
    type?: string;
}

interface modelObject<Subject extends string, Object extends string, ResultSet extends string> {
    subject: Subject;
    object: Object;
    keyField?: string;
    nameField?: string;
    tenantField?: string;
    typeField?: string;
    methods?: {
        get?: string;
        add?: string;
        fetch?: string;
        delete?: string;
        navigatorFetch?: string;
    },
    browser?: {
        title?: string;
        navigator?: boolean | {
            resultSet?: string;
            key?: string;
            title?: string;
        },
        permission?: {
            add?: boolean | string;
            delete?: boolean | string;
            edit?: boolean | string;
        }
        filter?: {},
        resultSet?: ResultSet;
        fetch?: fetch<ResultSet>;
        get?: get<ResultSet>;
        create?: Create[]
    },
    editor?: {

    },
    schema: Schema,
    cards?: Cards,
    layouts?: Layouts,
    reports?: Record<string, Partial<Pick<Report, 'columns' | 'params' | 'validation' | 'resultSet'>> & {fetch?: string}>
}

export function backendMock<
    Subject extends string,
    Object extends string,
    ResultSet extends string
>(
    objects: model<Subject, Object, ResultSet>[],
    lib: libFactory<{}, {}>[] | libFactory<{}, {}>,
    api?: {}
): handlerSet<{}, {}, {}>;

export function component<
    Subject extends string,
    Object extends string,
    ResultSet extends string
>(
    objects: model<Subject, Object, ResultSet>[],
    lib?: libFactory<{}, {}>[] | libFactory<{}, {}>
): pageSet<{}, {}>[];

export function validation<
    Subject extends string,
    Object extends string,
    ResultSet extends string
>(
    objects: model<Subject, Object, ResultSet>[],
    lib?: libFactory<{}, {}>[] | libFactory<{}, {}>
): validationOrLib[];

export function steps<
    Subject extends string,
    Object extends string,
    ResultSet extends string
>(
    objects: model<Subject, Object, ResultSet>[],
    lib?: libFactory<{}, {}>[] | libFactory<{}, {}>
): ReturnType<handlerSet<{}, {}, {}>>;

export function orchestratorMock<
    Subject extends string,
    Object extends string,
    ResultSet extends string
>(
    objects: model<Subject, Object, ResultSet>[],
    lib?: libFactory<{}, {}>[] | libFactory<{}, {}>
): ReturnType<handlerSet<{}, {}, {}>>;
