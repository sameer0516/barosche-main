"use client";
import React, { useState, useEffect } from "react";
import "./SizeGuide.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_STATIC = {
  heroTitle: "Jewellery Size Guide – Find Your Perfect Fit",
  heroDesc: "At Barosche, every piece is designed for effortless elegance and all-day comfort. Use our easy size guide to find the perfect fit for your rings, earrings, and pendants — so you can shop confidently.",
  
  ringTitle: "Ring Size Guide",
  ringMeasureTitle: "How to Measure Your Ring Size",
  rStep1Title: "Step 1",
  rStep1a: "Take a thin strip of paper or thread",
  rStep1b: "Wrap it snugly around your finger",
  rStep2Title: "Step 2",
  rStep2a: "Mark where it overlaps",
  rStep2b: "Measure the length using a ruler (mm)",
  rStep3Title: "Step 3",
  rStep3a: "Match it with the size chart below",
  
  expertTipsTitle: "Expert Tips for the Perfect Fit",
  tip1: "Measure your finger at the end of the day for the most accurate size",
  tip2: "Always measure twice to ensure precision",
  tip3: "Avoid measuring when your hands are cold, as fingers may shrink",
  tip4: "Wider rings tend to fit tighter — consider going one size up",
  tip5: "Choose a fit that feels comfortable, not too tight",
  tip6: "When gifting, it’s safer to choose a slightly larger size",
  
  ringChartTitle: "Ring Size Chart",
  thUsa: "USA Size",
  thEu: "EU Size",
  thDia: "Diameter (mm)",
  thCirc: "Circumference (mm)",
  ringNote: "Between sizes? Choose the larger size for comfort.",

  earringTitle: "Earrings Size Guide",
  earringDesc: "Unlike rings, earrings don’t require sizing for fit — but choosing the right size and scale enhances your overall look.",
  earringMeasureTitle: "How to Measure Your Earring Size",
  eStep1: "Step 1: Take a ruler or measuring scale. Check the size of earrings you already own (in mm).",
  eStep2: "Step 2: Measure the diameter (for hoops) or width (for studs). Compare the measurement with standard size ranges.",
  eStep3: "Step 3: Choose your preferred look from the size chart (Small = subtle, Medium = everyday, Large = statement).",
  commonEarringTitle: "Common Earring Sizes",
  styleTipTitle: "Style Tip:",
  styleTip1: "Smaller studs = everyday wear",
  styleTip2: "Medium hoops = versatile styling",
  styleTip3: "Larger designs = bold statement look",
  thType: "Type",
  thSize: "Size (mm)",
  thStyle: "Style Look",

  pendantTitle: "Pendant & Chain Size Guide",
  pendantDesc: "Choosing the right chain length ensures your pendant sits perfectly and complements your neckline.",
  pendantMeasureTitle: "How to Measure Your Pendant & Chain Size",
  pStep1: "Step 1: Take a measuring tape or string. Wrap it around your neck to your desired length.",
  pStep2: "Step 2: Adjust it to where you want the pendant to sit. Mark and measure the length (in inches or cm).",
  pStep3: "Step 3: Match your measurement with the chain length chart. Choose the length based on your style preference.",
  pendantChartTitle: "Pendant & Chain Length Guide",
  pendantRecommendedLabel: "Most Recommended:",
  pendantRecommendedText: '16"–18" for everyday pendant wear',
  thLength: "Length",
  thStyleCol: "Style",
  thWhere: "Where It Sits"
};

const INITIAL_RING_ROWS = [
  { usa: "4", eu: "47", dia: "13", circ: "47" },
  { usa: "4.5", eu: "48", dia: "14", circ: "48.2" },
  { usa: "5", eu: "49", dia: "15.7", circ: "49.3" },
  { usa: "5.5", eu: "51", dia: "16.1", circ: "50.6" },
  { usa: "6", eu: "52", dia: "16.5", circ: "51.9" },
  { usa: "6.5", eu: "53", dia: "16.9", circ: "53.9" },
  { usa: "7", eu: "54", dia: "17.3", circ: "54.4" },
  { usa: "7.5", eu: "56", dia: "17.7", circ: "55.7" },
  { usa: "8", eu: "57", dia: "18.1", circ: "57" },
  { usa: "8.5", eu: "58", dia: "18.5", circ: "58.3" },
  { usa: "9", eu: "59", dia: "19", circ: "59.5" },
  { usa: "9.5", eu: "61", dia: "19.4", circ: "60.8" },
  { usa: "10", eu: "62", dia: "19.8", circ: "62.1" }
];

const INITIAL_EARRING_ROWS = [
  { type: "Studs", size: "3–5 mm", look: "Minimal & subtle" },
  { type: "Studs", size: "6–8 mm", look: "Everyday classic" },
  { type: "Hoops", size: "10–20 mm", look: "Small & elegant" },
  { type: "Hoops", size: "20–40 mm", look: "Statement" },
  { type: "Drops", size: "Varies", look: "Dressy & elongated" }
];

const INITIAL_PENDANT_ROWS = [
  { length: '14" (35 cm)', style: "Choker", sit: "Close to neck" },
  { length: '16" (40 cm)', style: "Short", sit: "Collarbone" },
  { length: '18" (45 cm)', style: "Standard", sit: "Most popular" },
  { length: '20" (50 cm)', style: "Mid-length", sit: "Below collarbone" },
  { length: '24" (60 cm)', style: "Long", sit: "Upper chest" }
];

const INITIAL_FAQS = [
  { question: "1. How can I measure my ring size at home?", answer: "You can use a strip of paper or thread, wrap it around your finger, mark where it overlaps, and measure the length. Then match it with our ring size chart." },
  { question: "2. What if my ring size falls between two sizes?", answer: "If you're between sizes, we recommend choosing the slightly larger size for a more comfortable fit." },
  { question: "3. Does finger size change during the day?", answer: "Yes, fingers can expand due to temperature and activity. For best results, measure your finger at the end of the day." },
  { question: "4. Should I size up for wider rings?", answer: "Yes, wider rings tend to feel tighter, so going one size up is usually more comfortable." },
  { question: "5. Do I need to choose a size for earrings?", answer: "No, earrings typically come in standard sizes. However, you can choose different sizes (studs, hoops, drops) based on your style preference." },
  { question: "6. What size earrings are best for everyday wear?", answer: "Small to medium studs (3–6 mm) or small hoops (10–20 mm) are ideal for everyday comfort and elegance." },
  { question: "7. How do I choose the right earring size for my face?", answer: "Smaller earrings suit minimal looks, while larger hoops or drops create a bold, statement style. Choose based on your outfit and occasion." },
  { question: "8. What is the most popular necklace length?", answer: 'The most popular length is 16"–18", as it sits perfectly around the collarbone and suits most outfits.' },
  { question: "9. How do I choose the right pendant length?", answer: 'Choose shorter lengths (14"–16") for a choker style and longer lengths (18"–24") for a more relaxed or layered look.' },
  { question: "10. Will pendant size affect how the chain looks?", answer: "Yes, larger pendants look better on slightly longer chains, while smaller pendants suit shorter lengths." },
  { question: "11. What if I order the wrong size?", answer: "We recommend checking our size guide carefully before ordering. If unsure, choosing a slightly larger size is safer." },
  { question: "12. Is this size guide accurate for all jewellery?", answer: "Yes, our guide is designed to help you find the best fit for Barosche rings, earrings, and pendants." }
];

const SizePage = () => {
  const [content, setContent] = useState(DEFAULT_STATIC);
  const [ringRows, setRingRows] = useState(INITIAL_RING_ROWS);
  const [earringRows, setEarringRows] = useState(INITIAL_EARRING_ROWS);
  const [pendantRows, setPendantRows] = useState(INITIAL_PENDANT_ROWS);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();
        if (!detectData.success || detectData.languageCode === "en") return;

        const { languageCode } = detectData;
        const staticKeys = Object.keys(DEFAULT_STATIC);
        const staticValues = Object.values(DEFAULT_STATIC);
        const textsToTranslate = [...staticValues];

        INITIAL_RING_ROWS.forEach((row) => textsToTranslate.push(row.usa, row.eu, row.dia, row.circ));
        INITIAL_EARRING_ROWS.forEach((row) => textsToTranslate.push(row.type, row.size, row.look));
        INITIAL_PENDANT_ROWS.forEach((row) => textsToTranslate.push(row.length, row.style, row.sit));

        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts: textsToTranslate, targetLanguage: languageCode, sourceLanguage: "en" }),
        });

        const translateData = await translateRes.json();
        if (!translateData.success) return;

        const translations = translateData.translations;
        let pointer = 0;
        
        const translatedStatic = {};
        staticKeys.forEach((key) => { translatedStatic[key] = translations[pointer++] || DEFAULT_STATIC[key]; });

        const translatedRingRows = INITIAL_RING_ROWS.map((row) => ({
          usa: translations[pointer++] || row.usa,
          eu: translations[pointer++] || row.eu,
          dia: translations[pointer++] || row.dia,
          circ: translations[pointer++] || row.circ
        }));

        const translatedEarringRows = INITIAL_EARRING_ROWS.map((row) => ({ 
          type: translations[pointer++] || row.type, 
          size: translations[pointer++] || row.size, 
          look: translations[pointer++] || row.look 
        }));

        const translatedPendantRows = INITIAL_PENDANT_ROWS.map((row) => ({ 
          length: translations[pointer++] || row.length, 
          style: translations[pointer++] || row.style, 
          sit: translations[pointer++] || row.sit 
        }));

        setContent(translatedStatic);
        setRingRows(translatedRingRows);
        setEarringRows(translatedEarringRows);
        setPendantRows(translatedPendantRows);
      } catch (error) { console.error("Translation Error:", error); }
    };
    translateContent();
  }, []);

  return (
    <div className="size-guide-wrapper">
      
      {/* Hero Section */}
      <div className="size-guide-hero">
        <div className="hero-content">
          <h1>{content.heroTitle}</h1>
          <p>{content.heroDesc}</p>
        </div>
      </div>

      {/* Ring Size Guide Section */}
      <div className="centered-info-section" style={{ marginBottom: "20px" }}>
        <h2 className="section-main-title">{content.ringTitle}</h2>
      </div>

      <div className="ring-size-container">
        <div className="ring-text-content">
          <h3 className="section-sub-title" style={{ fontSize: "24px" }}>{content.ringMeasureTitle}</h3>
          
          <h4 className="step-heading">{content.rStep1Title}</h4>
          <ul className="step-list">
            <li>{content.rStep1a}</li>
            <li>{content.rStep1b}</li>
          </ul>
          
          <h4 className="step-heading">{content.rStep2Title}</h4>
          <ul className="step-list">
            <li>{content.rStep2a}</li>
            <li>{content.rStep2b}</li>
          </ul>
          
          <h4 className="step-heading">{content.rStep3Title}</h4>
          <ul className="step-list">
            <li>{content.rStep3a}</li>
          </ul>

          <h3 className="section-sub-title" style={{ fontSize: "22px", marginTop: "30px" }}>{content.expertTipsTitle}</h3>
          <ul className="expert-tips-list">
            <li>{content.tip1}</li>
            <li>{content.tip2}</li>
            <li>{content.tip3}</li>
            <li>{content.tip4}</li>
            <li>{content.tip5}</li>
            <li>{content.tip6}</li>
          </ul>
        </div>
        
        <div className="ring-image-content">
          <img src="/ringsize1.png" alt="Ring size guide" />
        </div>
      </div>

      {/* Ring Size Table */}
      <div className="chart-section-wrapper">
        <h3 className="table-title">{content.ringChartTitle}</h3>
        <div className="table-responsive-container">
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>{content.thUsa}</th>
                <th>{content.thEu}</th>
                <th>{content.thDia}</th>
                <th>{content.thCirc}</th>
              </tr>
            </thead>
            <tbody>
              {ringRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.usa}</td>
                  <td>{row.eu}</td>
                  <td>{row.dia}</td>
                  <td>{row.circ}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="recommended-text" style={{ fontStyle: "italic", marginTop: "15px" }}>
          {content.ringNote}
        </div>
      </div>


      {/* Earring Section */}
      <div className="centered-info-section">
        <h2 className="section-main-title">{content.earringTitle}</h2>
        <div className="centered-info-content"><p>{content.earringDesc}</p></div>
      </div>
      
      <div className="left-aligned-section">
        <h3 className="section-sub-title">{content.earringMeasureTitle}</h3>
        <div className="left-info-content">
          <p>{content.eStep1}</p>
          <p>{content.eStep2}</p>
          <p>{content.eStep3}</p>
        </div>
      </div>
      
      <div className="chart-section-wrapper">
        <h3 className="table-title">{content.commonEarringTitle}</h3>
        <div className="table-responsive-container">
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>{content.thType}</th>
                <th>{content.thSize}</th>
                <th>{content.thStyle}</th>
              </tr>
            </thead>
            <tbody>
              {earringRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.type}</td>
                  <td>{row.size}</td>
                  <td>{row.look}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="style-tip-container">
          <h4>{content.styleTipTitle}</h4>
          <ul>
            <li>{content.styleTip1}</li>
            <li>{content.styleTip2}</li>
            <li>{content.styleTip3}</li>
          </ul>
        </div>
      </div>


      {/* Pendant & Chain Section */}
      <div className="centered-info-section">
        <h2 className="section-main-title">{content.pendantTitle}</h2>
        <div className="centered-info-content"><p>{content.pendantDesc}</p></div>
      </div>
      
      <div className="left-aligned-section">
        <h3 className="section-sub-title">{content.pendantMeasureTitle}</h3>
        <div className="left-info-content">
          <p>{content.pStep1}</p>
          <p>{content.pStep2}</p>
          <p>{content.pStep3}</p>
        </div>
      </div>
      
      <div className="chart-section-wrapper" style={{ marginTop: "40px" }}>
        <h3 className="table-title">{content.pendantChartTitle}</h3>
        <div className="table-responsive-container">
          <table className="size-guide-table">
            <thead>
              <tr>
                <th>{content.thLength}</th>
                <th>{content.thStyleCol}</th>
                <th>{content.thWhere}</th>
              </tr>
            </thead>
            <tbody>
              {pendantRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.length}</td>
                  <td>{row.style}</td>
                  <td>{row.sit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="recommended-text">
          <strong>{content.pendantRecommendedLabel}</strong> {content.pendantRecommendedText}
        </div>
      </div>


      {/* FAQ SECTION */}
      <div className="faq-section-wrapper">
        <h2 className="section-main-title">Frequently Asked Questions</h2>
        <div className="faq-container">
          {INITIAL_FAQS.map((faq, index) => (
            <div className={`faq-item ${openFaqIndex === index ? "active" : ""}`} key={index}>
              <button 
                className="faq-question" 
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaqIndex === index}
              >
                {faq.question}
                <span className="faq-icon">{openFaqIndex === index ? "−" : "+"}</span>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SizePage;