export const envConfig = {
    qa: {
        baseUrl: 'https://qa.rxwizard.com/api/v1',
        doctorUsername: 'k6LoadTestingDoctor',
        doctorPassword: '70N*S7=+x#WC',
        officeId: 677,
        clientId: 1181,
        impression: 1,
        type: 4,
        jawtype: 1,
        category: 14,
        appliance: 18,
        dueDatesPayload: {
            categories: [14, 14],
            configuration: [1, 1],
            office: 677,
            type: 4,
            impression: 1,
        },
        createCasePayload: {
            office: 677,
            doctor: 1181,
            patient_first_name: "John",
            patient_last_name: "Doe",
            appointment_date: "",
            impression: 1,
            type: 4,
            due_date: null,
            rush_case: false,
            patient_shipping_data: null,
            client_files: [],
            orders: [
                {
                    category: 14,
                    appliance: 18,
                    instructions: "upper instructions",
                    configuration: 6893,
                    jaw_type: 1,
                    impression: 1,
                    type: 4,
                    products: [
                        {
                            product: 123695
                        },
                        {
                            product: 123701,
                            options: [
                                5,
                                4,
                                12,
                                13
                            ]
                        },
                        {
                            product: 123710
                        },
                        {
                            product: 123717
                        },
                        {
                            product: 123724,
                            options: [
                                2,
                                1,
                                9,
                                10
                            ]
                        },
                        {
                            product: 123733
                        },
                        {
                            product: 123739
                        },
                        {
                            product: 123743,
                            options: [
                                2,
                                1,
                                9,
                                10
                            ],
                            shade: "shade"
                        },
                        {
                            product: 123744,
                            options: [
                                27
                            ]
                        },
                        {
                            product: 123745
                        },
                        {
                            product: 123746
                        },
                        {
                            product: 123747
                        },
                        {
                            product: 123748
                        },
                        {
                            product: 123752
                        },
                        {
                            product: 123764,
                            options: [
                                2,
                                1,
                                9,
                                10
                            ]
                        },
                        {
                            product: 123767
                        }
                    ],
                    color: 86,
                    customizer_groups: [
                        9
                    ]
                },
                {
                    category: 14,
                    appliance: 18,
                    configuration: 6893,
                    jaw_type: 2,
                    impression: 1,
                    type: 4,
                    products: [
                        {
                            product: 123771
                        },
                        {
                            product: 123777,
                            options: [
                                5,
                                4,
                                12,
                                13
                            ]
                        },
                        {
                            product: 123786
                        },
                        {
                            product: 123793
                        },
                        {
                            product: 123800,
                            options: [
                                2,
                                1,
                                9,
                                10
                            ]
                        },
                        {
                            product: 123809
                        },
                        {
                            product: 123815
                        },
                        {
                            product: 123819,
                            options: [
                                3,
                                11
                            ],
                            shade: "shade"
                        }
                    ],
                    color: 86,
                    customizer_groups: [
                        9
                    ]
                }
            ]
        }
    },
};
