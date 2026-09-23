import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Colors,
} from 'chart.js';
import { number } from 'motion/react';
type AttendanceGraphProps = {
    presentAbsent: {
        present: number;
        absent: number;
        date_on: string;
    }[];
    numberOfParticipant: number;
};

ChartJS.register(ArcElement, Tooltip, Legend, Colors);
const AttendanceGraph = ({
    presentAbsent,
    numberOfParticipant,
}: AttendanceGraphProps) => {
    const countStep = () => {
        if (numberOfParticipant <= 5) {
            return 1;
        }
        if (numberOfParticipant <= 10) {
            return 2;
        }

        if (numberOfParticipant <= 25) {
            return 5;
        }

        if (numberOfParticipant <= 50) {
            return 10;
        }
        if (numberOfParticipant >= 100) {
            return 20;
        }
    };

    const data = useMemo(() => {
        return {
            labels: presentAbsent.map((presentAbsent) => presentAbsent.date_on),
            datasets: [
                {
                    label: 'Present',

                    data: presentAbsent.map(
                        (presentAbsent) => presentAbsent.present,
                    ),
                },
                {
                    label: 'Absent',

                    data: presentAbsent.map(
                        (presentAbsent) => presentAbsent.absent,
                    ),
                },
            ],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)',
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)',
            ],
        };
    }, [presentAbsent]);

    const options = {
        type: 'bar',
        resposive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: numberOfParticipant,
                ticks: {
                    stepSize: countStep(),
                },
            },
        },
    };
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Attendance Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-center">
                    <Bar data={data} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

export default memo(AttendanceGraph);
