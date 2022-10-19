/** @type { import('..').model<'model', 'plantation'> } */
export const plantation = ({joi}) => ({
    subject: 'model',
    object: 'plantation',
    browser: {
    },
    schema: {
        properties: {
            plantation: {
                properties: {
                    plantationName: {},
                    plantationDate: {},
                    plantedQuantity: {}
                }
            },
            tree: {
                widget: {
                    type: 'page',
                    page: 'model.tree.browse',
                    toolbar: false,
                    table: {
                        selectionMode: 'single'
                    }
                }
            }
        }
    },
    cards: {
        browse: {
            label: 'Plantations',
            widgets: ['plantation.treeName', 'plantation.treeDescription', 'plantation.quantity']
        },
        tree: {
            className: 'col-12',
            widgets: ['tree']
        },
        plantation: {
            label: 'Plantation',
            widgets: [
                'plantation.plantationName',
                'plantation.plantationDate',
                'plantation.plantedQuantity'
            ]
        }
    },
    layouts: {
        edit: {
            orientation: 'top',
            type: 'steps',
            items: [{
                label: 'Tree',
                widgets: ['tree']
            }, {
                label: 'Plantation',
                widgets: ['plantation']
            }]
        }
    }
});
