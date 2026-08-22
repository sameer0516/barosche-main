
import styles from "./QuickLinks.module.css";

export default function QuickLinksPage() {
  return (
    <>
      

      <main className={styles.wrapper}>
        <div className={styles.buttonGroup}>
          <a href="/" className={styles.btn}>
            Website
          </a>

          
           <a href="https://www.instagram.com/baroscheofficial/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.instaBtn}`}
          >
            Instagram
          </a>
        </div>
      </main>

      
    </>
  );
}