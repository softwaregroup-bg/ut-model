/* eslint-disable no-template-curly-in-string */
const treeFamily = [
    {value: 10, label: 'Adoxaceae'},
    {value: 11, label: 'Araliaceae'},
    {value: 12, label: 'Araucariaceae'},
    {value: 13, label: 'Asphodelaceae'},
    {value: 14, label: 'Betulaceae'},
    {value: 15, label: 'Cornaceae'},
    {value: 16, label: 'Cupressaceae'},
    {value: 17, label: 'Ericaceae'},
    {value: 18, label: 'Fabaceae'},
    {value: 19, label: 'Fagaceae'},
    {value: 20, label: 'Myrtaceae'},
    {value: 21, label: 'Moraceae'},
    {value: 22, label: 'Pinaceae'},
    {value: 23, label: 'Proteaceae'},
    {value: 24, label: 'Rosaceae'},
    {value: 25, label: 'Salicaceae'},
    {value: 26, label: 'Sapindaceae'},
    {value: 27, label: 'Taxaceae'},
    {value: 28, label: 'Ulmaceae'}
];

const threeCol = 'lg:col-6 xl:col-4';

/** @type { import('..').model<'model', 'tree'> } */
export const tree = ({joi}) => ({
    subject: 'model',
    object: 'tree',
    browser: {
        navigator: true,
        create: [{
            title: 'Add'
        }, {
            title: 'Add conifer',
            type: 'conifer'
        }, {
            title: 'Add broadleaf',
            type: 'broadleaf'
        }],
        permission: {
            delete: false
        },
        toolbar: [{
            title: 'Template',
            enabled: true,
            action: 'model.tree.new',
            params: {tree: {treeName: 'New tree', treeDescription: 'Tree description...', familyId: 20}}
        }, {
            title: 'Delete',
            enabled: 'current',
            action: 'model.tree.open',
            params: {id: '${id}', layout: 'delete'}
        }],
        table: {
            selectionMode: 'single'
        }
    },
    schema: {
        properties: {
            tree: {
                properties: {
                    treeName: {
                        title: 'Name'
                    },
                    familyId: {
                        title: 'Family',
                        widget: {
                            type: 'dropdown', options: treeFamily
                        }
                    },
                    maleCone: {
                        title: 'Male Cone'
                    },
                    femaleCone: {
                        title: 'Female Cone'
                    },
                    flowerDescription: {
                        title: 'Flower'
                    },
                    fruitName: {
                        title: 'Fruit'
                    },
                    habitatMap: {
                        title: 'Habitat'
                    }
                }
            },
            treeImages: {
                items: {
                    properties: {
                        imageTitle: {
                            title: 'Title'
                        },
                        imageUrl: {
                            title: 'Image'
                        }
                    }
                },
                widget: {type: 'table'}
            },
            links: {
                items: {
                    properties: {
                        linkUrl: {
                            title: 'URL'
                        },
                        linkTitle: {
                            title: 'Title'
                        }
                    }
                },
                widget: {type: 'table'}
            },
            reason: {
                widget: {
                    type: 'text'
                }
            }
        }
    },
    deleteMethods: {
        edit: 'model.tree.delete'
    },
    cards: {
        browse: {
            label: 'Trees',
            widgets: ['tree.treeName', 'tree.treeDescription']
        },
        toolbar: {
            type: 'toolbar',
            widgets: [{
                type: 'button',
                label: 'Browse',
                action: 'model.tree.browse',
                params: {}
            }, {
                type: 'button',
                label: 'Report',
                action: 'model.tree.report',
                params: {id: 'list'}
            }]
        },
        edit: {
            label: 'Identification',
            widgets: ['tree.treeName', 'tree.treeDescription', 'tree.familyId']
        },
        editDelete: {
            label: 'Identification',
            widgets: [{
                name: 'tree.treeName',
                disabled: true
            }, 'reason']
        },
        morphology: {
            label: 'Morphology',
            widgets: []
        },
        cone: {
            label: 'Cone',
            widgets: ['tree.maleCone', 'tree.femaleCone']
        },
        fruit: {
            label: 'Fruit',
            widgets: ['tree.flowerDescription', 'tree.fruitName']
        },
        col1: {
            label: 'Column 1',
            widgets: ['tree.treeName'],
            className: threeCol
        },
        col2: {
            label: 'Column 2',
            widgets: ['tree.treeDescription'],
            className: threeCol
        },
        col3: {
            label: 'Column 3',
            widgets: ['tree.familyId'],
            className: threeCol
        },
        images: {
            widgets: [{
                name: 'treeImages',
                widgets: ['imageTitle', 'imageUrl']
            }]
        },
        map: {
            widgets: ['tree.habitatMap']
        },
        links: {
            label: 'Links',
            widgets: [{
                name: 'links',
                widgets: ['linkUrl', 'linkTitle']
            }]
        },
        attachments: {
            label: 'Attachments',
            widgets: ['attachments']
        }
    },
    layouts: {
        editConifer: ['edit', 'cone'],
        editBroadleaf: ['edit', 'fruit'],
        editFlat: ['edit', 'cone', 'fruit'],
        editNested: ['edit', ['cone', 'fruit']],
        edit3col: ['col1', 'col2', 'col3'],
        editThumbIndex: [{
            id: 'main',
            icon: 'pi pi-file',
            items: [{
                label: 'Main',
                widgets: ['edit', 'morphology'],
                items: [
                    {label: 'Identification'},
                    {label: 'Morphology'}
                ]
            }, {
                label: 'Taxonomy',
                widgets: ['classification', 'clsLinks'],
                items: [
                    {label: 'Classification'},
                    {label: 'Links'}
                ]
            }]
        }, {
            id: 'images',
            icon: 'pi pi-images',
            items: [{
                label: 'Images',
                widgets: ['images']
            }]
        }, {
            id: 'misc',
            icon: 'pi pi-map',
            items: [{
                label: 'Habitat',
                widgets: ['map']
            }]
        }, {
            id: 'links',
            icon: 'pi pi-paperclip',
            items: [{
                label: 'Links',
                widgets: ['links', 'attachments']
            }]
        }]
    },
    reports: {
        list: {
            params: ['treeName', 'familyId'],
            columns: ['treeName', 'treeDescription'],
            fetch: 'model.tree.report'
        }
    }
});

export const modelTree = {};
