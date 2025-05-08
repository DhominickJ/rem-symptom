document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
    
    themeToggle.addEventListener('click', function() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Tab navigation
    const tabItems = document.querySelectorAll('.nav-tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Settings elements
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const showDiseasesTab = document.getElementById('showDiseasesTab');
    const diseasesTabBtn = document.getElementById('diseasesTabBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // Related symptoms elements
    const findRelatedBtn = document.getElementById('findRelatedBtn');
    const symptomSelect = document.getElementById('symptomSelect');
    const relatedSymptomsContainer = document.getElementById('relatedSymptomsContainer');
    const noRelatedFound = document.getElementById('noRelatedFound');
    const cooccurrenceSymptoms = document.getElementById('cooccurrenceSymptoms');
    const semanticSymptoms = document.getElementById('semanticSymptoms');
    
    // Story tab elements
    const analyzeTextBtn = document.getElementById('analyzeTextBtn');
    const symptomsText = document.getElementById('symptomsText');
    const extractedSymptomsContainer = document.getElementById('extractedSymptomsContainer');
    const noSymptomsFound = document.getElementById('noSymptomsFound');
    const extractedSymptoms = document.getElementById('extractedSymptoms');
    const possibleDiseases = document.getElementById('possibleDiseases');
    
    // Selected symptoms elements
    const selectedSymptoms = new Set();
    const selectedSymptomsContainer = document.getElementById('selectedSymptomsContainer');
    const noSelectedSymptoms = document.getElementById('noSelectedSymptoms');
    const selectedSymptomsEl = document.getElementById('selectedSymptoms');
    const selectedSymptomsActions = document.getElementById('selectedSymptomsActions');
    const clearSelectedBtn = document.getElementById('clearSelectedBtn');
    const analyzeSelectedBtn = document.getElementById('analyzeSelectedBtn');
    const selectedAnalysisResults = document.getElementById('selectedAnalysisResults');
    const selectedPossibleDiseases = document.getElementById('selectedPossibleDiseases');
    
    // History elements
    const historyList = document.getElementById('historyList');
    
    // Diseases tab elements
    const diseasesList = document.getElementById('diseasesList');
    
    // Tab switching
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab
            tabItems.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Settings panel toggle
    settingsBtn.addEventListener('click', function() {
        settingsPanel.classList.add('open');
        settingsOverlay.classList.add('open');
    });
    
    closeSettingsBtn.addEventListener('click', function() {
        settingsPanel.classList.remove('open');
        settingsOverlay.classList.remove('open');
    });
    
    settingsOverlay.addEventListener('click', function() {
        settingsPanel.classList.remove('open');
        this.classList.remove('open');
    });
    
    // Toggle diseases tab based on settings
    showDiseasesTab.addEventListener('change', function() {
        if (this.checked) {
            diseasesTabBtn.classList.remove('hidden');
        } else {
            diseasesTabBtn.classList.add('hidden');
            // If diseases tab is active, switch to related tab
            if (document.getElementById('diseasesTab').classList.contains('active')) {
                tabItems.forEach(tab => tab.classList.remove('active'));
                document.querySelector('.nav-tab-item[data-tab="relatedTab"]').classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById('relatedTab').classList.add('active');
            }
        }
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', function() {
        settingsPanel.classList.remove('open');
        settingsOverlay.classList.remove('open');
        // In a real app, you would save these settings to localStorage or a backend
    });
    
    // Event listener for finding related symptoms
    findRelatedBtn.addEventListener('click', function() {
        const symptom = symptomSelect.value;
        if (!symptom) {
            alert('Please select a symptom first.');
            return;
        }
        
        // Show loading state
        const originalText = findRelatedBtn.innerHTML;
        findRelatedBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
        findRelatedBtn.disabled = true;
        
        // Simulate API request with timeout
        setTimeout(function() {
            fetch(`/api/get_related_symptoms/${encodeURIComponent(symptom)}`)
                .then(response => response.json())
                .then(data => {
                    // Display related symptoms
                    displayRelatedSymptoms(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to fetch related symptoms.');
                });
            
            // Reset button state
            findRelatedBtn.innerHTML = originalText;
            findRelatedBtn.disabled = false;
        }, 1000);
    });
    
    // Event listener for analyzing text
    analyzeTextBtn.addEventListener('click', function() {
        const text = symptomsText.value.trim();
        if (!text) {
            alert('Please describe your symptoms first.');
            return;
        }
        
        // Show loading state
        const originalText = analyzeTextBtn.innerHTML;
        analyzeTextBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...';
        analyzeTextBtn.disabled = true;
        
        // Simulate API request with timeout
        setTimeout(function() {
            // Mock response data
            fetch(`/api/analyze_text/${encodeURIComponent(symptom)}`)
                .then(response => response.json())
                .then(data => {
                    // Display related symptoms
                    displayRelatedSymptoms(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to fetch related symptoms.');
                });
            
            // Display extracted symptoms
            displayExtractedSymptoms(response);
            
            // Reset button state
            analyzeTextBtn.innerHTML = originalText;
            analyzeTextBtn.disabled = false;
        }, 1500);
    });
    
    // Event listener for analyzing selected symptoms
    analyzeSelectedBtn.addEventListener('click', function() {
        if (selectedSymptoms.size === 0) {
            alert('Please select at least one symptom first.');
            return;
        }
        
        // Show loading state
        const originalText = analyzeSelectedBtn.innerHTML;
        analyzeSelectedBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...';
        analyzeSelectedBtn.disabled = true;
        
        // Simulate API request with timeout
        setTimeout(function() {
            // Mock response data
            const response = {
                possible_diseases: {
                    "Migraine": 0.92,
                    "Tension headache": 0.85,
                    "Viral infection": 0.68
                }
            };
            
            // Display possible diseases
            displaySelectedAnalysisResults(response);
            
            // Reset button state
            analyzeSelectedBtn.innerHTML = originalText;
            analyzeSelectedBtn.disabled = false;
        }, 1200);
    });
    
    // Event listener for clearing selected symptoms
    clearSelectedBtn.addEventListener('click', function() {
        // Clear selected symptoms
        selectedSymptoms.clear();
        updateSelectedSymptomsUI();
    });
    
    // Function to display related symptoms
    function displayRelatedSymptoms(data) {
        // Clear previous results
        cooccurrenceSymptoms.innerHTML = '';
        semanticSymptoms.innerHTML = '';
        
        // Display co-occurrence related symptoms
        if (data.cooccurrence_related && data.cooccurrence_related.length > 0) {
            data.cooccurrence_related.forEach(function(symptom) {
                const badge = document.createElement('span');
                badge.className = 'symptom-badge related';
                badge.textContent = symptom;
                badge.addEventListener('click', function() {
                    toggleSelectedSymptom(symptom);
                });
                cooccurrenceSymptoms.appendChild(badge);
            });
        } else {
            const noResults = document.createElement('p');
            noResults.className = 'text-gray-500 dark:text-slate-400';
            noResults.textContent = 'No co-occurrence related symptoms found.';
            cooccurrenceSymptoms.appendChild(noResults);
        }
        
        // Display semantically related symptoms
        if (data.semantic_related && data.semantic_related.length > 0) {
            data.semantic_related.forEach(function(item) {
                const badge = document.createElement('span');
                badge.className = 'symptom-badge related';
                badge.textContent = item.symptom;
                badge.title = 'Similarity: ' + item.score.toFixed(2);
                badge.addEventListener('click', function() {
                    toggleSelectedSymptom(item.symptom);
                });
                semanticSymptoms.appendChild(badge);
            });
        } else {
            const noResults = document.createElement('p');
            noResults.className = 'text-gray-500 dark:text-slate-400';
            noResults.textContent = 'No semantically related symptoms found.';
            semanticSymptoms.appendChild(noResults);
        }
        
        // Show results container
        relatedSymptomsContainer.classList.remove('hidden');
        noRelatedFound.classList.add('hidden');
    }
    
    // Function to display extracted symptoms
    function displayExtractedSymptoms(data) {
        // Clear previous results
        extractedSymptoms.innerHTML = '';
        possibleDiseases.innerHTML = '';
        
        // Display extracted symptoms
        if (data.extracted_symptoms && data.extracted_symptoms.length > 0) {
            data.extracted_symptoms.forEach(function(item) {
                const badge = document.createElement('span');
                badge.className = 'symptom-badge extracted';
                badge.textContent = item.symptom;
                badge.title = 'Confidence: ' + item.confidence.toFixed(2);
                
                // Add direct match indicator
                if (item.is_direct_match) {
                    badge.classList.add('direct-match');
                }
                
                // Add click handler for adding to selected symptoms
                badge.addEventListener('click', function() {
                    toggleSelectedSymptom(item.symptom);
                });
                
                extractedSymptoms.appendChild(badge);
            });
            
            // Show results container
            extractedSymptomsContainer.classList.remove('hidden');
            noSymptomsFound.classList.add('hidden');
            
            // Display possible diseases
            displayPossibleDiseases(data.possible_diseases);
        } else {
            // Show no symptoms found message
            extractedSymptomsContainer.classList.add('hidden');
            noSymptomsFound.classList.remove('hidden');
        }
    }
    
    // Function to display possible diseases
    function displayPossibleDiseases(diseases) {
        // Clear previous results
        possibleDiseases.innerHTML = '';
        
        if (Object.keys(diseases).length > 0) {
            // Sort diseases by score
            const sortedDiseases = Object.entries(diseases)
                .sort((a, b) => b[1] - a[1]);
            
            // Get max score for normalization
            const maxScore = sortedDiseases[0][1];
            
            // Display diseases
            sortedDiseases.forEach(function([disease, score]) {
                const normalized = (score / maxScore) * 100;
                
                const diseaseItem = document.createElement('div');
                diseaseItem.className = 'disease-item';
                
                const diseaseName = document.createElement('span');
                diseaseName.className = 'disease-name';
                diseaseName.textContent = disease;
                
                const scoreDisplay = document.createElement('div');
                scoreDisplay.className = 'flex items-center';
                
                const scoreValue = document.createElement('span');
                scoreValue.className = 'disease-score';
                scoreValue.textContent = score.toFixed(1);
                
                const confidenceBar = document.createElement('div');
                confidenceBar.className = 'confidence-bar';
                
                const confidenceFill = document.createElement('div');
                confidenceFill.className = 'confidence-bar-fill';
                confidenceFill.style.width = normalized + '%';
                
                confidenceBar.appendChild(confidenceFill);
                scoreDisplay.appendChild(scoreValue);
                scoreDisplay.appendChild(confidenceBar);
                diseaseItem.appendChild(diseaseName);
                diseaseItem.appendChild(scoreDisplay);
                
                possibleDiseases.appendChild(diseaseItem);
            });
        } else {
            const noResults = document.createElement('p');
            noResults.className = 'text-gray-500 dark:text-slate-400';
            noResults.textContent = 'No associated conditions found.';
            possibleDiseases.appendChild(noResults);
        }
    }
    
    // Function to display selected symptoms analysis results
    function displaySelectedAnalysisResults(data) {
        // Clear previous results
        selectedPossibleDiseases.innerHTML = '';
        
        // Display possible diseases
        displayPossibleDiseasesForSelected(data.possible_diseases);
        
        // Show results container
        selectedAnalysisResults.classList.remove('hidden');
    }
    
    // Function to display possible diseases for selected symptoms
    function displayPossibleDiseasesForSelected(diseases) {
        // Clear previous results
        selectedPossibleDiseases.innerHTML = '';
        
        if (Object.keys(diseases).length > 0) {
            // Sort diseases by score
            const sortedDiseases = Object.entries(diseases)
                .sort((a, b) => b[1] - a[1]);
            
            // Get max score for normalization
            const maxScore = sortedDiseases[0][1];
            
            // Display diseases
            sortedDiseases.forEach(function([disease, score]) {
                const normalized = (score / maxScore) * 100;
                
                const diseaseItem = document.createElement('div');
                diseaseItem.className = 'disease-item';
                
                const diseaseName = document.createElement('span');
                diseaseName.className = 'disease-name';
                diseaseName.textContent = disease;
                
                const scoreDisplay = document.createElement('div');
                scoreDisplay.className = 'flex items-center';
                
                const scoreValue = document.createElement('span');
                scoreValue.className = 'disease-score';
                scoreValue.textContent = score.toFixed(1);
                
                const confidenceBar = document.createElement('div');
                confidenceBar.className = 'confidence-bar';
                
                const confidenceFill = document.createElement('div');
                confidenceFill.className = 'confidence-bar-fill';
                confidenceFill.style.width = normalized + '%';
                
                confidenceBar.appendChild(confidenceFill);
                scoreDisplay.appendChild(scoreValue);
                scoreDisplay.appendChild(confidenceBar);
                diseaseItem.appendChild(diseaseName);
                diseaseItem.appendChild(scoreDisplay);
                
                selectedPossibleDiseases.appendChild(diseaseItem);
            });
            
            // Also update the diseases tab if visible
            if (!diseasesTabBtn.classList.contains('hidden')) {
                diseasesList.innerHTML = '';
                sortedDiseases.forEach(function([disease, score]) {
                    const diseaseItem = document.createElement('div');
                    diseaseItem.className = 'disease-item';
                    
                    const diseaseName = document.createElement('span');
                    diseaseName.className = 'disease-name';
                    diseaseName.textContent = disease;
                    
                    const scoreDisplay = document.createElement('div');
                    scoreDisplay.className = 'flex items-center';
                    
                    const scoreValue = document.createElement('span');
                    scoreValue.className = 'disease-score';
                    scoreValue.textContent = score.toFixed(1);
                    
                    const confidenceBar = document.createElement('div');
                    confidenceBar.className = 'confidence-bar';
                    
                    const confidenceFill = document.createElement('div');
                    confidenceFill.className = 'confidence-bar-fill';
                    confidenceFill.style.width = normalized + '%';
                    
                    confidenceBar.appendChild(confidenceFill);
                    scoreDisplay.appendChild(scoreValue);
                    scoreDisplay.appendChild(confidenceBar);
                    diseaseItem.appendChild(diseaseName);
                    diseaseItem.appendChild(scoreDisplay);
                    
                    diseasesList.appendChild(diseaseItem);
                });
            }
        } else {
            const noResults = document.createElement('p');
            noResults.className = 'text-gray-500 dark:text-slate-400';
            noResults.textContent = 'No associated conditions found.';
            selectedPossibleDiseases.appendChild(noResults);
        }
    }
    
    // Function to toggle a symptom in the selected symptoms list
    function toggleSelectedSymptom(symptom) {
        if (selectedSymptoms.has(symptom)) {
            selectedSymptoms.delete(symptom);
        } else {
            selectedSymptoms.add(symptom);
        }
        
        updateSelectedSymptomsUI();
    }
    
    // Function to update the selected symptoms UI
    function updateSelectedSymptomsUI() {
        // Clear previous results
        selectedSymptomsEl.innerHTML = '';
        
        if (selectedSymptoms.size > 0) {
            // Display selected symptoms
            selectedSymptoms.forEach(function(symptom) {
                const badge = document.createElement('span');
                badge.className = 'symptom-badge selected';
                badge.textContent = symptom;
                
                // Add remove button
                const removeBtn = document.createElement('span');
                removeBtn.className = 'ml-1';
                removeBtn.innerHTML = '&times;';
                removeBtn.style.cursor = 'pointer';
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    selectedSymptoms.delete(symptom);
                    updateSelectedSymptomsUI();
                });
                
                badge.appendChild(removeBtn);
                selectedSymptomsEl.appendChild(badge);
            });
            
            // Show actions and hide placeholder
            selectedSymptomsActions.classList.remove('hidden');
            noSelectedSymptoms.classList.add('hidden');
            
            // Hide analysis results when symptoms change
            selectedAnalysisResults.classList.add('hidden');
        } else {
            // Show placeholder and hide actions
            selectedSymptomsActions.classList.add('hidden');
            noSelectedSymptoms.classList.remove('hidden');
            selectedAnalysisResults.classList.add('hidden');
        }
    }
});