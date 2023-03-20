import joi from 'joi'
import type {Schema, PropertyEditor, Cards, Layouts, Layout, Action, Properties, DataTable, DataView} from 'ut-prime/core/types';
import type {Props as ActionButtonProps} from 'ut-prime/core/ActionButton/ActionButton.types';
import {Props as ReportProps} from 'ut-prime/core/Report/Report.types';
import {Props as ExplorerProps} from 'ut-prime/core/Explorer/Explorer.types';
import {handlerSet, libFactory, validationOrLib} from 'ut-run';
import type {pageSet} from 'ut-portal';

export type model<
    Subject extends string,
    Object extends string,
    ResultSet extends string = Object
> = (api: {joi: joi.Root}) => modelObject<Subject, Object, ResultSet>;

export type override<
    Subject extends string,
    Object extends string,
    ResultSet extends string = Object
> = (api: {joi: never}) => (Omit<modelObject<Subject, Object, ResultSet>, 'schema'> & {schema?: Schema})

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

interface BrowserLayout<ResultSet extends string> extends Partial<Omit<ExplorerProps, 'fetch' | 'toolbar' | 'layout'>> {
    fetch?: fetch<ResultSet>;
    toolbar?: false | Omit<ActionButtonProps, 'getValues'>[],
    layout?: Layout;
    navigator?: boolean | {
        resultSet?: string;
        key?: string;
        title?: string;
    },
    get?: get<ResultSet>;
    create?: Create[]
}


type modelObject<Subject extends string, Object extends string, ResultSet extends string> = {
    subject: Subject;
    object: Object;
    objectTitle?: string;
    keyField?: string;
    nameField?: string;
    tenantField?: string;
    typeField?: string;
    methods?: {
        get?: string;
        add?: string;
        edit?: string;
        fetch?: string;
        delete?: string;
        navigatorFetch?: string;
    },
    [name: `${string}Methods`]: {
        get?: string;
        add?: string;
        edit?: string;
        fetch?: string;
        delete?: string;
        navigatorFetch?: string;
    },
    browser?: BrowserLayout<ResultSet> & {
        title?: string;
        permission?: {
            add?: boolean | string;
            delete?: boolean | string;
            edit?: boolean | string;
        }
    },
    editor?: {

    },
    schema: Schema,
    cards?: Cards,
    layouts?: Layouts,
    browsers?: Record<string, BrowserLayout<ResultSet>>,
    reports?: Record<string, Partial<Pick<ReportProps, 'columns' | 'params' | 'resultSet'>> & {fetch?: string}>
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
    lib?: libFactory<{}, {}>[] | libFactory<{}, {}>,
    override?: libFactory<{}, {}>[] | libFactory<{}, {}>
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

export function orchestrator<
    Subject extends string,
    Object extends string,
    ResultSet extends string
>(
    objects: model<Subject, Object, ResultSet>[],
    lib?: libFactory<{}, {}>[] | libFactory<{}, {}>
): ReturnType<handlerSet<{}, {}, {}>>;
