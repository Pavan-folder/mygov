document.addEventListener('DOMContentLoaded', function() {
    const stateSelect = document.getElementById('state');
    const districtSelect = document.getElementById('district');
    const submitBtn = document.getElementById('submit');
    const detectBtn = document.getElementById('detectDistrict');
    const resultsDiv = document.getElementById('results');

    // Static districts for Andhra Pradesh
    const districts = [
        'ALLURI SITHARAMA RAJU',
        'ANAKAPALLI',
        'ANANTHAPURAMU',
        'ANNAMAYYA',
        'BAPATLA',
        'CHITTOOR',
        'DR. B.R. AMBEDKAR KONASEEMA',
        'EAST GODAVARI',
        'ELURU',
        'GUNTUR',
        'KAKINADA',
        'KRISHNA',
        'KURNOOL',
        'NANDYAL',
        'NTR',
        'PALNADU',
        'PARVATHIPURAM MANYAM',
        'PRAKASAM',
        'SRI POTTI SRIRAMULU NELLORE',
        'SRI SATHYA SAI',
        'SRIKAKULAM',
        'TIRUPATI',
        'VISAKHAPATNAM',
        'VIZIANAGARAM',
        'WEST GODAVARI',
        'YSR KADAPA'
    ];

    // Static sample data for demonstration
    const staticData = [
        {
            month: 'Feb',
            year: '2024-2025',
            data: {
                employment_generated: 123456,
                households_covered: 789,
                total_expenditure: 12345678,
                works_completed: 123
            }
        }
    ];

    // Populate states dynamically
    fetchStates();

    stateSelect.addEventListener('change', function() {
        const selectedState = this.value;
        if (selectedState) {
            fetchDistricts(selectedState);
        } else {
            districtSelect.disabled = true;
            districtSelect.innerHTML = '<option value="">Select District</option>';
        }
    });

    submitBtn.addEventListener('click', function() {
        const state = stateSelect.value;
        const district = districtSelect.value;
        if (state && district) {
            fetchData(state, district);
        }
    });

    detectBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                detectDistrictFromLocation(lat, lon);
            }, function(error) {
                alert('Location access denied. Please select your district manually.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    function fetchDistricts(state) {
        // Use static districts for Andhra Pradesh
        districtSelect.innerHTML = '<option value="">Select District</option>';
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
    }

    function fetchStates() {
        // Only show Andhra Pradesh as requested
        stateSelect.innerHTML = '<option value="">Select State</option>';
        const option = document.createElement('option');
        option.value = 'ANDHRA PRADESH';
        option.textContent = 'ANDHRA PRADESH';
        stateSelect.appendChild(option);
        // Auto-select Andhra Pradesh and populate districts
        stateSelect.value = 'ANDHRA PRADESH';
        fetchDistricts('ANDHRA PRADESH');
    }

    function fetchData(state, district) {
        // Use static data for demonstration
        displayData(staticData);
    }

    function displayData(data) {
        resultsDiv.innerHTML = '<h2>Data for selected district</h2>';
        if (data.length === 0) {
            resultsDiv.innerHTML += '<p>No data available for this district. Please try another district or check back later.</p>';
            return;
        }

        // Summary cards
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-cards';
        summaryDiv.innerHTML = `
            <div class="summary-card">
                <h3>Total Employment</h3>
                <p class="metric">${data.reduce((sum, item) => sum + (item.data?.employment_generated || 0), 0).toLocaleString()}</p>
                <p class="description">Person-days of work provided</p>
            </div>
            <div class="summary-card">
                <h3>Households Helped</h3>
                <p class="metric">${data.reduce((sum, item) => sum + (item.data?.households_covered || 0), 0).toLocaleString()}</p>
                <p class="description">Families who got work</p>
            </div>
            <div class="summary-card">
                <h3>Total Money Spent</h3>
                <p class="metric">₹${data.reduce((sum, item) => sum + (item.data?.total_expenditure || 0), 0).toLocaleString()}</p>
                <p class="description">Government expenditure</p>
            </div>
            <div class="summary-card">
                <h3>Works Completed</h3>
                <p class="metric">${data.reduce((sum, item) => sum + (item.data?.works_completed || 0), 0).toLocaleString()}</p>
                <p class="description">Projects finished</p>
            </div>
        `;
        resultsDiv.appendChild(summaryDiv);

        // Create multiple charts
        const chartsDiv = document.createElement('div');
        chartsDiv.className = 'charts-container';

        // Employment chart
        const empDiv = document.createElement('div');
        empDiv.className = 'chart-container';
        empDiv.innerHTML = '<h3>Employment Generated (Person-days)</h3>';
        const empCtx = document.createElement('canvas');
        empCtx.className = 'chart';
        empDiv.appendChild(empCtx);
        chartsDiv.appendChild(empDiv);

        // Households chart
        const houseDiv = document.createElement('div');
        houseDiv.className = 'chart-container';
        houseDiv.innerHTML = '<h3>Households Covered</h3>';
        const houseCtx = document.createElement('canvas');
        houseCtx.className = 'chart';
        houseDiv.appendChild(houseCtx);
        chartsDiv.appendChild(houseDiv);

        // Expenditure chart
        const expDiv = document.createElement('div');
        expDiv.className = 'chart-container';
        expDiv.innerHTML = '<h3>Expenditure (₹)</h3>';
        const expCtx = document.createElement('canvas');
        expCtx.className = 'chart';
        expDiv.appendChild(expCtx);
        chartsDiv.appendChild(expDiv);

        resultsDiv.appendChild(chartsDiv);

        const labels = data.map(item => `${item.month || 'Feb'} ${item.year}`);
        const employmentData = data.map(item => item.data?.employment_generated || 0);
        const householdData = data.map(item => item.data?.households_covered || 0);
        const expenditureData = data.map(item => item.data?.total_expenditure || 0);

        // Employment chart
        new Chart(empCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Employment (Person-days)',
                    data: employmentData,
                    borderColor: 'rgb(255, 0, 0)',
                    backgroundColor: 'rgba(255, 0, 0, 1.0)',
                    borderWidth: 14,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(255, 0, 0)',
                    pointBorderColor: 'rgb(255, 255, 255)',
                    pointBorderWidth: 5,
                    pointRadius: 14,
                    pointHoverRadius: 16
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Households chart
        new Chart(houseCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Households',
                    data: householdData,
                    backgroundColor: 'rgba(255, 0, 0, 1.0)',
                    borderColor: 'rgb(255, 0, 0)',
                    borderWidth: 14,
                    borderRadius: 4,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(255, 0, 0, 1.0)',
                    hoverBorderColor: 'rgb(255, 0, 0)',
                    hoverBorderWidth: 16
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        // Expenditure chart
        new Chart(expCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenditure (₹)',
                    data: expenditureData,
                    borderColor: 'rgb(255, 255, 0)',
                    backgroundColor: 'rgba(255, 255, 0, 1.0)',
                    borderWidth: 14,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(255, 255, 0)',
                    pointBorderColor: 'rgb(255, 255, 255)',
                    pointBorderWidth: 5,
                    pointRadius: 14,
                    pointHoverRadius: 16
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 100000).toFixed(1) + 'L';
                            }
                        }
                    }
                }
            }
        });

        // Monthly breakdown table
        const tableDiv = document.createElement('div');
        tableDiv.className = 'data-table';
        tableDiv.innerHTML = '<h3>Monthly Breakdown</h3>';
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Month & Year</th>
                    <th>Employment (Days)</th>
                    <th>Households</th>
                    <th>Expenditure (₹)</th>
                    <th>Works Completed</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(item => `
                    <tr>
                        <td>${item.month || 'Feb'} ${item.year || '2024-2025'}</td>
                        <td>${(item.data?.employment_generated || 0).toLocaleString()}</td>
                        <td>${(item.data?.households_covered || 0).toLocaleString()}</td>
                        <td>₹${(item.data?.total_expenditure || 0).toLocaleString()}</td>
                        <td>${(item.data?.works_completed || 0).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        tableDiv.appendChild(table);
        resultsDiv.appendChild(tableDiv);
    }

    function detectDistrictFromLocation(lat, lon) {
        // Comprehensive district detection for Andhra Pradesh
        // Using more inclusive coordinate ranges and better logic

        console.log(`Detecting location for coordinates: ${lat}, ${lon}`);

        // Andhra Pradesh bounds (expanded to cover the entire state)
        if (lat >= 12.0 && lat <= 20.0 && lon >= 76.0 && lon <= 87.0) {
            stateSelect.value = 'ANDHRA PRADESH';

            // Create a more inclusive detection system
            // Use broader ranges and prioritize major districts

            // Northern Coastal Andhra (Visakhapatnam region)
            if (lat >= 17.0 && lat <= 19.0 && lon >= 81.0 && lon <= 85.0) {
                if (lat >= 17.5 && lon >= 83.0) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'VISAKHAPATNAM';
                        alert('Detected your location: Visakhapatnam District, Andhra Pradesh');
                    });
                } else if (lat >= 17.0 && lon >= 82.0) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'ANAKAPALLI';
                        alert('Detected your location: Anakapalli District, Andhra Pradesh');
                    });
                } else {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'SRIKAKULAM';
                        alert('Detected your location: Srikakulam District, Andhra Pradesh');
                    });
                }
            }
            // East Godavari and surrounding areas
            else if (lat >= 16.0 && lat <= 18.0 && lon >= 80.0 && lon <= 83.0) {
                if (lon >= 81.5) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'EAST GODAVARI';
                        alert('Detected your location: East Godavari District, Andhra Pradesh');
                    });
                } else {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'WEST GODAVARI';
                        alert('Detected your location: West Godavari District, Andhra Pradesh');
                    });
                }
            }
            // Krishna, Guntur, and surrounding areas
            else if (lat >= 15.0 && lat <= 17.0 && lon >= 78.0 && lon <= 82.0) {
                if (lat >= 16.0 && lon >= 80.0) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'KRISHNA';
                        alert('Detected your location: Krishna District, Andhra Pradesh');
                    });
                } else if (lat >= 15.5 && lon >= 79.0) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'GUNTUR';
                        alert('Detected your location: Guntur District, Andhra Pradesh');
                    });
                } else {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'PRAKASAM';
                        alert('Detected your location: Prakasam District, Andhra Pradesh');
                    });
                }
            }
            // Rayalaseema region (southern Andhra Pradesh)
            else if (lat >= 12.0 && lat <= 15.0 && lon >= 76.0 && lon <= 81.0) {
                if (lat >= 14.0 && lon >= 78.0) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'YSR KADAPA';
                        alert('Detected your location: YSR Kadapa District, Andhra Pradesh');
                    });
                } else if (lat >= 13.0 && lon >= 77.0) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'ANANTHAPURAMU';
                        alert('Detected your location: Ananthapuramu District, Andhra Pradesh');
                    });
                } else {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'KURNOOL';
                        alert('Detected your location: Kurnool District, Andhra Pradesh');
                    });
                }
            }
            // Central Andhra regions
            else if (lat >= 14.0 && lat <= 16.0 && lon >= 77.0 && lon <= 80.0) {
                if (lon >= 78.5) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'NANDYAL';
                        alert('Detected your location: Nandyal District, Andhra Pradesh');
                    });
                } else {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'KURNOOL';
                        alert('Detected your location: Kurnool District, Andhra Pradesh');
                    });
                }
            }
            // Nellore and surrounding areas
            else if (lat >= 13.0 && lat <= 15.0 && lon >= 78.0 && lon <= 82.0) {
                fetchDistricts('ANDHRA PRADESH').then(() => {
                    districtSelect.value = 'SRI POTTI SRIRAMULU NELLORE';
                    alert('Detected your location: Sri Potti Sreeramulu Nellore District, Andhra Pradesh');
                });
            }
            // Chittoor and Tirupati areas
            else if (lat >= 12.5 && lat <= 14.0 && lon >= 77.0 && lon <= 80.0) {
                if (lat >= 13.5) {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'TIRUPATI';
                        alert('Detected your location: Tirupati District, Andhra Pradesh');
                    });
                } else {
                    fetchDistricts('ANDHRA PRADESH').then(() => {
                        districtSelect.value = 'CHITTOOR';
                        alert('Detected your location: Chittoor District, Andhra Pradesh');
                    });
                }
            }
            // Default fallback for Andhra Pradesh - pick a major district
            else {
                // Instead of showing generic message, pick the most likely district based on coordinates
                fetchDistricts('ANDHRA PRADESH').then(() => {
                    // Default to a central district
                    districtSelect.value = 'GUNTUR';
                    alert('Location detected in Andhra Pradesh. Defaulting to Guntur District. Please select your specific district if different.');
                });
            }
        } else {
            alert('Location detected outside Andhra Pradesh. Please select your state and district manually.');
        }
    }
});
