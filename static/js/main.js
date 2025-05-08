// static/js/main.js

$(document).ready(function() {
    // Store selected symptoms
    const selectedSymptoms = new Set();
    
    // Event listener for finding related symptoms
    $('#findRelatedBtn').click(function() {
        const symptom = $('#symptomSelect').val();
        if (!symptom) {
            alert('Please select a symptom first.');
            return;
        }
        
        // Show loading state
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...');
        $(this).prop('disabled', true);
        
        // Make API request
        $.ajax({
            url: '/api/related_symptoms',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ symptom: symptom }),
            success: function(response) {
                // Display related symptoms
                displayRelatedSymptoms(response);
                
                // Reset button state
                $('#findRelatedBtn').html('Find Related Symptoms');
                $('#findRelatedBtn').prop('disabled', false);
            },
            error: function(error) {
                console.error('Error:', error);
                alert('An error occurred while finding related symptoms.');
                
                // Reset button state
                $('#findRelatedBtn').html('Find Related Symptoms');
                $('#findRelatedBtn').prop('disabled', false);
            }
        });
    });
    
    // Event listener for analyzing text
    $('#analyzeTextBtn').click(function() {
        const text = $('#symptomsText').val().trim();
        if (!text) {
            alert('Please describe your symptoms first.');
            return;
        }
        
        // Show loading state
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...');
        $(this).prop('disabled', true);
        
        // Make API request
        $.ajax({
            url: '/api/analyze_text',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ text: text }),
            success: function(response) {
                // Display extracted symptoms
                displayExtractedSymptoms(response);
                
                // Reset button state
                $('#analyzeTextBtn').html('Analyze');
                $('#analyzeTextBtn').prop('disabled', false);
            },
            error: function(error) {
                console.error('Error:', error);
                alert('An error occurred while analyzing your symptoms.');
                
                // Reset button state
                $('#analyzeTextBtn').html('Analyze');
                $('#analyzeTextBtn').prop('disabled', false);
            }
        });
    });
    
    // Event listener for analyzing selected symptoms
    $('#analyzeSelectedBtn').click(function() {
        if (selectedSymptoms.size === 0) {
            alert('Please select at least one symptom first.');
            return;
        }
        
        // Show loading state
        $(this).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyzing...');
        $(this).prop('disabled', true);
        
        // Make API request
        $.ajax({
            url: '/api/analyze_text',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ text: Array.from(selectedSymptoms).join(' ') }),
            success: function(response) {
                // Display possible diseases
                displaySelectedAnalysisResults(response);
                
                // Reset button state
                $('#analyzeSelectedBtn').html('Analyze Selected Symptoms');
                $('#analyzeSelectedBtn').prop('disabled', false);
            },
            error: function(error) {
                console.error('Error:', error);
                alert('An error occurred while analyzing selected symptoms.');
                
                // Reset button state
                $('#analyzeSelectedBtn').html('Analyze Selected Symptoms');
                $('#analyzeSelectedBtn').prop('disabled', false);
            }
        });
    });
    
    // Event listener for clearing selected symptoms
    $('#clearSelectedBtn').click(function() {
        // Clear selected symptoms
        selectedSymptoms.clear();
        updateSelectedSymptomsUI();
    });
    
    // Function to display related symptoms
    function displayRelatedSymptoms(data) {
        // Clear previous results
        $('#cooccurrenceSymptoms').empty();
        $('#semanticSymptoms').empty();
        
        // Display co-occurrence related symptoms
        if (data.cooccurrence_related && data.cooccurrence_related.length > 0) {
            data.cooccurrence_related.forEach(function(symptom) {
                const badge = $('<span>')
                    .addClass('symptom-badge related')
                    .text(symptom)
                    .click(function() {
                        toggleSelectedSymptom(symptom);
                    });
                $('#cooccurrenceSymptoms').append(badge);
            });
        } else {
            $('#cooccurrenceSymptoms').append('<p>No co-occurrence related symptoms found.</p>');
        }
        
        // Display semantically related symptoms
        if (data.semantic_related && data.semantic_related.length > 0) {
            data.semantic_related.forEach(function(item) {
                const badge = $('<span>')
                    .addClass('symptom-badge related')
                    .text(item.symptom)
                    .attr('title', 'Similarity: ' + item.score.toFixed(2))
                    .click(function() {
                        toggleSelectedSymptom(item.symptom);
                    });
                $('#semanticSymptoms').append(badge);
            });
        } else {
            $('#semanticSymptoms').append('<p>No semantically related symptoms found.</p>');
        }
        
        // Show results container
        $('#relatedSymptomsContainer').removeClass('d-none');
        $('#noRelatedFound').addClass('d-none');
    }
    
    // Function to display extracted symptoms
    function displayExtractedSymptoms(data) {
        // Clear previous results
        $('#extractedSymptoms').empty();
        $('#possibleDiseases').empty();
        
        // Display extracted symptoms
        if (data.extracted_symptoms && data.extracted_symptoms.length > 0) {
            data.extracted_symptoms.forEach(function(item) {
                const badge = $('<span>')
                    .addClass('symptom-badge extracted')
                    .text(item.symptom)
                    .attr('title', 'Confidence: ' + item.confidence.toFixed(2));
                
                // Add direct match indicator
                if (item.is_direct_match) {
                    badge.addClass('direct-match');
                }
                
                // Add click handler for adding to selected symptoms
                badge.click(function() {
                    toggleSelectedSymptom(item.symptom);
                });
                
                $('#extractedSymptoms').append(badge);
            });
            
            // Show results container
            $('#extractedSymptomsContainer').removeClass('d-none');
            $('#noSymptomsFound').addClass('d-none');
            
            // Display possible diseases
            displayPossibleDiseases(data.possible_diseases);
        } else {
            // Show no symptoms found message
            $('#extractedSymptomsContainer').addClass('d-none');
            $('#noSymptomsFound').removeClass('d-none');
        }
    }
    
    // Function to display possible diseases
    function displayPossibleDiseases(diseases) {
        // Clear previous results
        $('#possibleDiseases').empty();
        
        if (Object.keys(diseases).length > 0) {
            // Sort diseases by score
            const sortedDiseases = Object.entries(diseases)
                .sort((a, b) => b[1] - a[1]);
            
            // Get max score for normalization
            const maxScore = sortedDiseases[0][1];
            
            // Display diseases
            sortedDiseases.forEach(function([disease, score]) {
                const normalized = (score / maxScore) * 100;
                
                const diseaseItem = $('<div>').addClass('disease-item');
                const diseaseName = $('<span>').addClass('disease-name').text(disease);
                const scoreDisplay = $('<div>').addClass('d-flex align-items-center');
                
                const scoreValue = $('<span>').addClass('disease-score').text(score.toFixed(1));
                const confidenceBar = $('<div>').addClass('confidence-bar');
                const confidenceFill = $('<div>')
                    .addClass('confidence-bar-fill')
                    .css('width', normalized + '%');
                
                confidenceBar.append(confidenceFill);
                scoreDisplay.append(scoreValue, confidenceBar);
                diseaseItem.append(diseaseName, scoreDisplay);
                
                $('#possibleDiseases').append(diseaseItem);
            });
        } else {
            $('#possibleDiseases').append('<p>No associated conditions found.</p>');
        }
    }
    
    // Function to display selected symptoms analysis results
    function displaySelectedAnalysisResults(data) {
        // Clear previous results
        $('#selectedPossibleDiseases').empty();
        
        // Display possible diseases
        displayPossibleDiseasesForSelected(data.possible_diseases);
        
        // Show results container
        $('#selectedAnalysisResults').removeClass('d-none');
    }
    
    // Function to display possible diseases for selected symptoms
    function displayPossibleDiseasesForSelected(diseases) {
        // Clear previous results
        $('#selectedPossibleDiseases').empty();
        
        if (Object.keys(diseases).length > 0) {
            // Sort diseases by score
            const sortedDiseases = Object.entries(diseases)
                .sort((a, b) => b[1] - a[1]);
            
            // Get max score for normalization
            const maxScore = sortedDiseases[0][1];
            
            // Display diseases
            sortedDiseases.forEach(function([disease, score]) {
                const normalized = (score / maxScore) * 100;
                
                const diseaseItem = $('<div>').addClass('disease-item');
                const diseaseName = $('<span>').addClass('disease-name').text(disease);
                const scoreDisplay = $('<div>').addClass('d-flex align-items-center');
                
                const scoreValue = $('<span>').addClass('disease-score').text(score.toFixed(1));
                const confidenceBar = $('<div>').addClass('confidence-bar');
                const confidenceFill = $('<div>')
                    .addClass('confidence-bar-fill')
                    .css('width', normalized + '%');
                
                confidenceBar.append(confidenceFill);
                scoreDisplay.append(scoreValue, confidenceBar);
                diseaseItem.append(diseaseName, scoreDisplay);
                
                $('#selectedPossibleDiseases').append(diseaseItem);
            });
        } else {
            $('#selectedPossibleDiseases').append('<p>No associated conditions found.</p>');
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
        $('#selectedSymptoms').empty();
        
        if (selectedSymptoms.size > 0) {
            // Display selected symptoms
            selectedSymptoms.forEach(function(symptom) {
                const badge = $('<span>')
                    .addClass('symptom-badge selected')
                    .text(symptom);
                
                // Add remove button
                const removeBtn = $('<span>')
                    .addClass('ms-1')
                    .html('&times;')
                    .css('cursor', 'pointer')
                    .click(function(e) {
                        e.stopPropagation();
                        selectedSymptoms.delete(symptom);
                        updateSelectedSymptomsUI();
                    });
                
                badge.append(removeBtn);
                $('#selectedSymptoms').append(badge);
            });
            
            // Show actions and hide placeholder
            $('#selectedSymptomsActions').removeClass('d-none');
            $('#noSelectedSymptoms').addClass('d-none');
            
            // Hide analysis results when symptoms change
            $('#selectedAnalysisResults').addClass('d-none');
        } else {
            // Show placeholder and hide actions
            $('#selectedSymptomsActions').addClass('d-none');
            $('#noSelectedSymptoms').removeClass('d-none');
            $('#selectedAnalysisResults').addClass('d-none');
        }
    }
});