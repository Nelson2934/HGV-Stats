import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  // State variables
  const [hgvElements, setHgvElements] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    'VOR': 0,
    'On Route': 0,
    'Yard': 0,
    'Running Defect': 0
  });
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState('');

  // Initialize dashboard on component mount
  useEffect(() => {
    initializeDashboard();
    updateLastUpdated();
  }, []);

  // Initialize dashboard with HGVs
  const initializeDashboard = () => {
    const totalHGVs = 57;
    const newHgvElements = [];
    const newStatusCounts = {
      'VOR': 0,
      'On Route': 0,
      'Yard': 0,
      'Running Defect': 0
    };

    // Create HGV elements
    for (let i = 1; i <= totalHGVs; i++) {
      // Default to random status if no data
      const statusOptions = ['VOR', 'On Route', 'Yard', 'Running Defect'];
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      // Create HGV element
      newHgvElements.push({
        id: i,
        status: randomStatus,
        location: 'N/A',
        driver: 'N/A'
      });
      
      // Increment status count
      newStatusCounts[randomStatus]++;
    }
    
    setHgvElements(newHgvElements);
    setStatusCounts(newStatusCounts);
  };

  // Update the "last updated" timestamp
  const updateLastUpdated = () => {
    setLastUpdated(new Date().toLocaleString());
  };

  // Handle status change for an HGV
  const handleStatusChange = (id, newStatus, previousStatus) => {
    setStatusCounts(prev => ({
      ...prev,
      [previousStatus]: prev[previousStatus] - 1,
      [newStatus]: prev[newStatus] + 1
    }));
    
    setHgvElements(prev => prev.map(hgv => 
      hgv.id === id ? { ...hgv, status: newStatus } : hgv
    ));
    
    updateLastUpdated();
  };

  // Filter HGVs based on search input and filter button
  const filterHGVs = (hgv) => {
    const matchesSearch = searchText === '' || 
      hgv.id.toString().toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = activeFilter === 'all' || hgv.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle filter button click
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // Handle clear button click
  const handleClearClick = () => {
    if (confirm('Are you sure you want to set all HGVs to "Yard" status?')) {
      const totalHGVs = hgvElements.length;
      const newStatusCounts = {
        'VOR': 0,
        'On Route': 0,
        'Yard': totalHGVs,
        'Running Defect': 0
      };
      
      setHgvElements(prev => prev.map(hgv => ({ ...hgv, status: 'Yard' })));
      setStatusCounts(newStatusCounts);
      updateLastUpdated();
    }
  };

  // CSS Styles
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px"
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
      color: "#1e3a8a",
      fontSize: "28px"
    },
    stats: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "center",
      marginBottom: "20px"
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "8px 15px",
      borderRadius: "5px",
      fontWeight: "bold",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    },
    vor: {
      backgroundColor: "#ffebee",
      color: "#d32f2f"
    },
    route: {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32"
    },
    yard: {
      backgroundColor: "#e3f2fd",
      color: "#1976d2"
    },
    defect: {
      background: 'linear-gradient(to right, #e8f5e9 50%, #ffebee 50%)',
      color: "#333"
    },
    controls: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: "20px",
      gap: "10px"
    },
    searchBox: {
      padding: "8px 15px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      flex: "1",
      maxWidth: "300px"
    },
    clearBtn: {
      padding: "8px 15px",
      backgroundColor: "#ff5722",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold"
    },
    filters: {
      display: "flex",
      flexWrap: "wrap",
      gap: "5px"
    },
    filterBtn: {
      padding: "8px 15px",
      border: "none",
      borderRadius: "5px",
      backgroundColor: "#f0f0f0",
      cursor: "pointer"
    },
    activeFilter: {
      backgroundColor: "#2196F3",
      color: "white"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "20px"
    },
    hgvCard: {
      backgroundColor: "white",
      border: "1px solid #eee",
      borderRadius: "5px",
      padding: "15px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
      cursor: "pointer"
    },
    hgvCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
    },
    vorCard: {
      borderLeft: "5px solid #d32f2f"
    },
    routeCard: {
      borderLeft: "5px solid #2e7d32"
    },
    yardCard: {
      borderLeft: "5px solid #1976d2"
    },
    defectCard: {
      borderLeft: "5px solid #ff9800"
    },
    hgvTitle: {
      margin: "0 0 10px 0",
      fontSize: "18px",
      fontWeight: "bold"
    },
    statusSelect: {
      width: "100%",
      padding: "8px",
      marginTop: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc"
    },
    footer: {
      textAlign: "center",
      fontSize: "14px",
      color: "#666",
      marginTop: "30px"
    }
  };

  return (
    <>
      <Head>
        <title>HGV Status Dashboard</title>
        <meta name="description" content="Track the status of your HGV fleet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <h1 style={styles.header}>HGV Status Dashboard</h1>
        
        {/* Stats */}
        <div style={styles.stats}>
          <div style={{...styles.statItem, ...styles.vor}}>
            <span>VOR:</span>
            <span>{statusCounts['VOR']}</span>
          </div>
          <div style={{...styles.statItem, ...styles.route}}>
            <span>On Route:</span>
            <span>{statusCounts['On Route']}</span>
          </div>
          <div style={{...styles.statItem, ...styles.yard}}>
            <span>Yard:</span>
            <span>{statusCounts['Yard']}</span>
          </div>
          <div style={{...styles.statItem, ...styles.defect}}>
            <span>Running Defect:</span>
            <span>{statusCounts['Running Defect']}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div style={styles.controls}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              placeholder="Search HGV..." 
              value={searchText}
              onChange={handleSearchInputChange}
              style={styles.searchBox}
            />
            <button 
              style={styles.clearBtn} 
              onClick={handleClearClick}
            >
              Clear All Status
            </button>
          </div>
          
          <div style={styles.filters}>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'all' ? styles.activeFilter : {})
              }} 
              onClick={() => handleFilterClick('all')}
            >
              All
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'VOR' ? styles.activeFilter : {})
              }} 
              onClick={() => handleFilterClick('VOR')}
            >
              VOR
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'On Route' ? styles.activeFilter : {})
              }} 
              onClick={() => handleFilterClick('On Route')}
            >
              On Route
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'Yard' ? styles.activeFilter : {})
              }} 
              onClick={() => handleFilterClick('Yard')}
            >
              Yard
            </button>
            <button 
              style={{
                ...styles.filterBtn, 
                ...(activeFilter === 'Running Defect' ? styles.activeFilter : {})
              }} 
              onClick={() => handleFilterClick('Running Defect')}
            >
              Running Defect
            </button>
          </div>
        </div>
        
        {/* HGV Grid */}
        <div style={styles.grid}>
          {hgvElements.filter(filterHGVs).map(hgv => {
            // Get styles based on status
            let statusStyles = {};
            switch(hgv.status) {
              case 'VOR':
                statusStyles = styles.vorCard;
                break;
              case 'On Route':
                statusStyles = styles.routeCard;
                break;
              case 'Yard':
                statusStyles = styles.yardCard;
                break;
              case 'Running Defect':
                statusStyles = styles.defectCard;
                break;
            }
            
            return (
              <div key={hgv.id} style={{...styles.hgvCard, ...statusStyles}}>
                <h3 style={styles.hgvTitle}>HGV {hgv.id}</h3>
                <p>Status: <strong>{hgv.status}</strong></p>
                {hgv.location !== 'N/A' && <p>Location: {hgv.location}</p>}
                {hgv.driver !== 'N/A' && <p>Driver: {hgv.driver}</p>}
                
                <select 
                  value={hgv.status} 
                  onChange={(e) => handleStatusChange(hgv.id, e.target.value, hgv.status)}
                  style={styles.statusSelect}
                >
                  <option value="VOR">VOR</option>
                  <option value="On Route">On Route</option>
                  <option value="Yard">Yard</option>
                  <option value="Running Defect">Running Defect</option>
                </select>
              </div>
            );
          })}
        </div>
        
        <div style={styles.footer}>
          Last updated: {lastUpdated}
        </div>
      </div>
    </>
  );
}
