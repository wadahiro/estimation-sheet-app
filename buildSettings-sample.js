module.exports = {
    default: {
        estimationMetadata: [
            { name: 'customerName', 'label': '発行先正式社名', 'required': true },
            { name: 'issueDate', 'label': '発行希望日' },
            { name: 'title', 'label': '件名', 'required': true },
            { name: 'deliveryDate', 'label': '納品日' },
            { name: 'deliveryPlace', 'label': '納品場所' },
            { name: 'contractStartDate', 'label': '契約期間開始日' },
            { name: 'contractEndDate', 'label': '契約期間終了日' }
        ],
        summaryColumns: [
            { name: 'cost', 'label': '仕入額(コスト)', type: 'yen' },
            { name: 'receipt', 'label': '売上', type: 'yen' },
            { name: 'profitRate', 'label': '利益率', type: 'rate' }
        ],
        purchaseItemsColumns: [
            [
                { name: 'itemId', 'label': '商品番号' },
                { name: 'name', 'label': '商品名' },
                { name: 'unit', 'label': '単位' },
                { name: 'suppliersPrice', 'label': '仕入単価', type: 'yen' }
            ]
        ]
    },
    settings: [
        {
            summaryColumns: [
                { name: 'receipt', 'label': '売上', type: 'yen' }
            ],
            purchaseItemsColumns: [
                [
                    { name: 'itemId', 'label': '商品番号' },
                    { name: 'name', 'label': '商品名' },
                    { name: 'unit', 'label': '単位' }
                ]
            ]
        }
    ]
};