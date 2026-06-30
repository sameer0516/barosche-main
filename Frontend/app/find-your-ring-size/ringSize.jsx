import styles from "./ringSize.module.css";

const ringSizes = [
    { usa: 4, eu: 47, diameter: 13, circumference: 47 },
    { usa: 4.5, eu: 48, diameter: 14, circumference: 48.2 },
    { usa: 5, eu: 49, diameter: 15.7, circumference: 49.3 },
    { usa: 5.5, eu: 51, diameter: 16.1, circumference: 50.6 },
    { usa: 6, eu: 52, diameter: 16.5, circumference: 51.9 },
    { usa: 6.5, eu: 53, diameter: 16.9, circumference: 53.9 },
    { usa: 7, eu: 54, diameter: 17.3, circumference: 54.4 },
    { usa: 7.5, eu: 56, diameter: 17.7, circumference: 55.7 },
    { usa: 8, eu: 57, diameter: 18.1, circumference: 57 },
    { usa: 8.5, eu: 58, diameter: 18.5, circumference: 58.3 },
    { usa: 9, eu: 59, diameter: 19, circumference: 59.5 },
    { usa: 9.5, eu: 61, diameter: 19.4, circumference: 60.8 },
    { usa: 10, eu: 62, diameter: 19.8, circumference: 62.1 },
];

export default function RingSize() {
    return (
        <>
            <div className="RingSize">
                <div className={styles.wrapper}>
                    <h2 className={styles.title}>How To Find Your Ring Size</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>USA Size</th>
                                    <th>EU Size</th>
                                    <th>Diameter (mm)</th>
                                    <th>Circumference (mm)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ringSizes.map((row) => (
                                    <tr key={row.usa}>
                                        <td>{row.usa}</td>
                                        <td>{row.eu}</td>
                                        <td>{row.diameter}</td>
                                        <td>{row.circumference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}