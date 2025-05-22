import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './DiaryPageRenderer.css';

const DiaryPageRenderer = ({ diaryPage }) => {
  const diaryRef = useRef(null);

  const downloadAsPDF = async () => {
    if (!diaryRef.current) return;

    try {
      const canvas = await html2canvas(diaryRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`photo-panel-${diaryPage._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!diaryPage || !diaryPage.photos) {
    return <div>Loading photo panel...</div>;
  }

  const formattedDate = new Date(diaryPage.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if content is an array (panel format) or string (old diary format)
  const isPanelFormat = Array.isArray(diaryPage.content);

  return (
    <div className="diary-page-container">
      <button className="btn btn-primary download-btn" onClick={downloadAsPDF}>
        Download as PDF
      </button>
      
      <div className="diary-page panel-page" ref={diaryRef}>
        <div className="diary-header">
          <h2 className="diary-date">{formattedDate}</h2>
          <h1 className="diary-title">Photo Panel</h1>
        </div>
        
        {isPanelFormat ? (
          <div className="comic-grid">
            {diaryPage.photos.map((photo, index) => {
              // Ensure we don't go beyond available content
              // If content array is shorter than photos array, use the content in order until we run out
              const contentIndex = Math.min(index, diaryPage.content.length - 1);
              const panelData = diaryPage.content[contentIndex] || { punchline: '', description: '' };
              
              return (
                <div key={photo._id} className="comic-row">
                  {/* Photo Panel */}
                  <div className="comic-panel photo-panel">
                    <img 
                      src={`${process.env.REACT_APP_API_URL || ''}/${photo.path}`} 
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="panel-photo" 
                    />
                    <div className="panel-punchline speech-bubble">
                      <p>{panelData.punchline}</p>
                    </div>
                  </div>
                  
                  {/* Text Panel */}
                  <div className="comic-panel text-panel">
                    <div className="panel-description thought-bubble">
                      <p>{panelData.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="diary-photos">
              {diaryPage.photos.map((photo, index) => (
                <div key={photo._id} className="diary-photo">
                  <img 
                    src={`${process.env.REACT_APP_API_URL || ''}/${photo.path}`} 
                    alt={photo.caption || `Photo ${index + 1}`} 
                  />
                </div>
              ))}
            </div>
            
            <div className="diary-content">
              {diaryPage.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiaryPageRenderer;
