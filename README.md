# Data model library `ut-model`

`ut-model` is a utility library for creating common functionality like:

- create, edit, delete, browse, report and other generic pages
- mocks for back end API
- mocks for back end orchestrator
- backend validations
- automated test steps

It is intended to define a standard design for UI pages, back end APIs
and other structures, which enable fast creation of default functionality,
which can be customized only if needed. At some point it will be enough to call it
with minimum parameters and get a lot of default functionality:

```js
import model from 'ut-model';
export default model.component([
    ({joi}) => {
        subject: 'model',
        object: 'tree'
    }
]);

```

`ut-model` exposes several functions, which expect as their first parameter
an array of model definition functions. These functions receive as parameter
an object with the properties:

- `joi` - the joi validation api

Then these functions return an object with the following properties:

- `subject` - name of the module to create pages/mocks for
- `object` - name of the object to create pages/mocks for
- `objectTitle` - title of the object to use in the pages,
  the default is capitalized `object`
- `keyField` - name of the key field in the `subject.object` table,
    the default is ``${object}Id``
- `nameField` - the name of the field, which represents the object name
  or a similar concept. This field is rendered as a link in the `browse` page.
  The default is `${object}Name`
- `tenantField` - the name of the field, which represents the tenant (if any).
  The default is `businessUnitId`.
- `methods` - an object with the following properties:
  - `fetch` - the name of the method used for fetching a list of objects,
    the default is `${subject}.${object}.fetch`,
  - `add` - the name of the method used for creating a new object,
    the default is `${subject}.${object}.add`,
  - `delete` - the name of the method used for deleting an object,
    the default is `${subject}.${object}.delete`,
  - `get` - the name of the method used for retrieving a single object,
    the default is `${subject}.${object}.get`,
  - `edit` - the name of the method used for modifying a single object,
    the default is `${subject}.${object}.edit`
- `schema` - an object, which describes the API parameters in the form of JSON schema
  with some extra properties. The important properties are:
  - `title` - the text to show for the field in a table header, form label, etc.
  - `filter` - a boolean, that activates the filtering by this field in the
    `browse` page. The default is `false`.
  - `sort` - a boolean, that activates the sorting by this field in the
    `browse` page. The default is `false`.
  - `validation` - joi validation object, used to validate the field in the
    `subject.object.open`, `subject.object.new` pages.
  - `widget` - configuration for the widget used in forms or tables
- `cards` - an object, which describes named groups of properties. Cards are an
  abstraction for some visual components which involve a list of properties,
  such as:
  - columns in a table
  - fields in a form
  - parameters in a report
  The `cards` object maps card names to objects, having the following properties:
  - `label` - Optional property, which defines the text to be shown, for specific
    visual component cases
  - `widgets`- Array of strings, representing the property names. The array may
    include other arrays, to describe specific layout designs, such as: groups
    of columns, vertical layouts nested in horizontal ones and so on. Refer to
    the storybook for examples.
  - `className` - Controls the layout properties of the visual component. For
    example in a form, the default layout is to display cards in two columns.
    To change it to three columns for big screens
    ( > 1200px as per [primeflex](https://www.primefaces.org/primereact/showcase/#/primeflex)),
    pass `'lg:col-6 xl:col-4'` for `className`

  For more information check the component
  [Editor](https://github.com/softwaregroup-bg/ut-front-devextreme/tree/master/src/components/Editor)
  in `ut-front-devextreme`.
- `layouts` - an object, which describes named groups of cards. Each property
  of this object describes one layout as an array of card names or as a tree
  structure. Layouts are an abstraction for configuring the layout of predefined
  page designs like:
  - page for browsing a list of objects (`subject.object.browse`)
  - pages for creation or editing a single object (`subject.object.new` and `subject.object.open`)
  - pages for reports (`subject.object.report`)

  When the layout is described as a tree structure, it usually describes some tabbed
  layout with one or more levels of nesting. The tree structure follows the
  [PrimeReact MenuModel API](https://www.primefaces.org/primereact/showcase/#/menumodel),
  with one additional property `cards`, which is the array of card names.
  Check the [storybook](./portal/index.stories.js) for examples.

- `browser` - an object, which configures the `browse` page. It accepts the
  following properties:
  - `title` - Title of the browse page. The default is `${objectTitle} list`,
  - `navigator` - A boolean, which indicates if a navigator for the tenants
    will be shown. The default is false.
  - `navigatorFetchMethod` - The name of the method used to fetch data for the
  navigator component. The default is `customerOrganizationGraphFetch`.
  - `fetch` - an optional function, that adapts the parameters of the standard
  fetch function, to a back end, that does not follow the standard parameters.
  By default the fetch method parameter is an object with the following properties:
    - `[object]` - this represents the filter to be applied. The name of the property
    is based on the name of the passed `object` to the function.
    - `orderBy` - defines the sorting of the result, through an array of
    `{field, dir}` objects, corresponding to the `core.orderByTT` table type.
    The property dir is either `ASC` or `DESC`.
    - `paging` - defines the paging of the result as an object `{pageNumber, pageSize}`,
    corresponding to the `core.pagingTT` table type.

    If the back end expects different properties, this function is called and must
    return the expected parameters, based on the standard ones. For example, if the
    back end expects the filter in a property named `filterBy`, instead of a property
    named `someObject`, the following can be passed:

    ```js
    require('ut-model').component(() => ({
        browser: {
            fetch: ({
                someObject: filterBy,
                orderBy,
                paging
            }) => ({
                filterBy,
                orderBy,
                paging
            })
        }
    }))
    ```

  - `resultSet` - The name of the property, in which the fetched data is
    returned. By default the fetch method is expected to return an object
    with the shape `{ [resultSet], pagination: { recordsTotal } }`.
    The property `resultSet` contains an array of objects, representing the
    fetched data.
    By default `resultSet` equals the object name passed in the `object` parameter.
  - `create` - By default the `browse` page includes one button for creation of
    new objects. If the creation of new objects requires more than one button,
    this parameter enables defining of the buttons and the parameters to pass
    to the object creation page. The `create` parameter accepts an array of
    objects with the following properties:
    - `type` - this is passed as parameter to the object creation page
    - `permission` - the permission to check
    - `...params` - the rest of the properties are passed to the actions
    parameter of the `<Explorer>` component.
  - `delete` - By default the `browse` page includes a button for deletion
    of objects by calling the `${subject}.${object}.delete` back end method.
    This parameter allows to reshape the parameters expected by the back end.
    The `delete` function receives an array of objects selected for deletion
    in the `browse` page and must return the expected parameter, as per the
    back end API. By default it is expected that the back end accepts a
    parameter with property named after the key field, which is of type
    core.arrayNumberList.
    This corresponds to the following `delete` function, which is the default:

    ```js
    require('ut-model').component(() => ({
        browser: {
            delete: instances => ({
                [keyField]: instances.map(instance => ({
                    value: instance[keyField]
                }))
            })
        }
    }))
    ```

- `editor` - an object, which configures the editor in the `subject.object.open`
  and `subject.object.add` pages. It accepts the following properties:
  - `typeField` - Sometimes object edition page has different layout, depending
  on the type of object. In such cases, this parameter defines the name of the
  property, that defines the object type. Based on object type, for example
  `foo`, the layout is picked from the `layouts` parameter, from a property named
  `editFoo`, i.e. the capitalized type prefixed with `edit`.

The module exposes the following functions:

- `component` - a function, which returns and array of functions, which define
  UI pages and components, such as:
  - `editor` - an editor component
  - `subject.object.browse` - a page for browsing the objects
  - `subject.object.new` - a page for creation of new objects
  - `subject.object.open` - a page for editing (or viewing) existing objects

  The `component()` function is intended to be used in the  `browser` layer:

  ```js
  import model from 'ut-model'
  export default () => function utUser() {
      return {
          config: require('./config'),
          browser: () => [
              ...model.component(models)
          ]
      };
  };
  ```

- `backendMock` - a function, which returns mocks for backend APIs:
  - `subject.object.fetch`
  - `subject.object.add`
  - `subject.object.delete`
  - `subject.object.get`
  - `subject.object.edit`

  These mock functions allow easier creation of Storybook stories
  and UI unit tests.
  The `backendMock` function accepts as second parameter a callback function,
  which must return an object which maps mock names (in the form `subjectObject`)
  to objects with the  following properties:
  - `objects` - an optional array of objects to be used as mock data.
  - `fetch` - an optional function, which reshapes the structure
  of the parameters and result of the `fetch`
  method of the actual back end APIs to the standard
  structure expected by the mock. This is only needed in cases
  the back end differs from the standard fetch API shape, which is:
    - `{[object], orderBy, paging}` - for the parameters
    - `{[object], pagination}` - for the result
  The passed `fetch` function receives a single parameter `filter`, which
  is the default mock function for filtering, i.e. a function
  expecting the default parameter and result structures above.
  The passed `fetch` function could reshape the non-standard back end
  parameters, before calling `filter` and then reshape the result to
  the shape of the non-standard back end result.
  For example, if the real back end expects a property named `filterBy`,
  instead of `someObject` the following can be passed to `mock`:

  ```js
  require('ut-model')(() => ({
      subject: 'subject',
      object: 'object',
      ...rest
  }), () => ({
      subjectObject: {
        fetch: filter => ({
            filterBy,
            orderBy,
            paging
        }) => filter({
            someObject: filterBy,
            orderBy,
            paging
        })
      }
  }))
  ```

  Note: usually the `fetch` function passed to `mock` does the opposite
  of the `fetch` function passed in `browser.fetch` and when one of these
  is passed, the other one needs to be passed too.
