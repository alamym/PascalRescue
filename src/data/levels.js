export const levels = {
    floors: [
        {
            id: 1,
            name: "Ground Floor: Number Mastery",
            rooms: [
                {
                    id: 101,
                    name: "Room 101",
                    teacher: "Mr. Jones",
                    topic: "Powers of 10 & Multiples",
                    minions: [
                        { type: "multiple", target: 10 },
                        { type: "power10", val: 100 },
                        { type: "multiple", target: 5 }
                    ],
                    boss: {
                        question: "What is 12 x 1000?",
                        answer: "12000",
                        hint: "Count the zeros in 1000 and append them to 12."
                    },
                    reward: "Badge of Zeros"
                },
                {
                    id: 102,
                    name: "Room 102",
                    teacher: "Ms. Smith",
                    topic: "Factors & Prime Numbers",
                    minions: [
                        { type: "factor", target: 12 },
                        { type: "prime", range: [1, 20] },
                        { type: "factor", target: 20 }
                    ],
                    boss: {
                        question: "Is 17 a prime number? (Type 1 for Yes, 0 for No)",
                        answer: "1",
                        hint: "A prime number only has two factors: 1 and itself."
                    },
                    reward: "Prime Protector"
                },
                {
                    id: 103,
                    name: "Room 103",
                    teacher: "Mr. Lee",
                    topic: "Estimation & Rounding",
                    minions: [
                        { type: "multiple", target: 100 },
                        { type: "power10", val: 1000 },
                        { type: "multiple", target: 20 }
                    ],
                    boss: {
                        question: "What is 45 x 100?",
                        answer: "4500",
                        hint: "Multiply by 100 by moving the decimal point two places to the right."
                    },
                    reward: "Estimation Expert"
                }
            ]
        }
    ]
};
