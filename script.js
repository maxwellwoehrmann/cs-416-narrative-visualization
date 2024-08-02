hideAgeFields();

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 900 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const tooltip = d3.select("body").append("div")
.attr("id", "tooltip")
.style("position", "absolute")
.style("text-align", "center")
.style("padding", "2px")
.style("font", "12px sans-serif")
.style("background", "lightsteelblue")
.style("border", "0px")
.style("border-radius", "8px")
.style("pointer-events", "none")
.style("opacity", 0);

d3.csv("https://media.githubusercontent.com/media/maxwellwoehrmann/cs-416-narrative-visualization/main/crime-data.csv").then(function(data) {
    console.log("CSV Data Loaded:", data);
    crimeData = data;

    const crimeTypeCounts = d3.rollup(
        crimeData,
        v => v.length,
        d => d['Crm Cd Desc']
    );
    
    // Sort crime types by frequency and get the top 5
    const sortedCrimeTypes = Array.from(crimeTypeCounts, ([key, value]) => ({ crimeType: key, count: value }))
        .sort((a, b) => d3.descending(a.count, b.count));
    
    const top5CrimeTypes = sortedCrimeTypes.slice(0, 5).map(d => d.crimeType);
    const otherCrimeTypes = sortedCrimeTypes.slice(5).map(d => d.crimeType);
    
    // Create buttons for the top 5 crime types and an "Other" button
    const buttonContainer = d3.select("#filter-buttons");
    top5CrimeTypes.forEach(crimeType => {
        buttonContainer.append("button")
            .attr("class", "filter-button")
            .text(crimeType)
            .on("click", () => updateChart(crimeType));
    });
    
    buttonContainer.append("button")
        .attr("class", "filter-button")
        .text("Other")
        .on("click", () => updateChart("Other"));

    buttonContainer.append("button")
        .attr("class", "filter-button")
        .text("All")
        .on("click", () => updateChart("All"));
    
    
    // Initial render
    renderScene(currentSceneIndex);
    
    function updateChart(crimeType) {
        let filteredData;
        if (crimeType === "Other") {
            filteredData = crimeData.filter(d => otherCrimeTypes.includes(d['Crm Cd Desc']));
        } else if (crimeType === "All") {
            filteredData = crimeData; 
        } else {
            filteredData = crimeData.filter(d => d['Crm Cd Desc'] === crimeType);
        }
        scenes[currentSceneIndex].render(filteredData);
    }

    // Age filter event listener
    document.getElementById("filter-age-button").addEventListener("click", function() {
        const minAge = parseInt(document.getElementById("min-age").value);
        const maxAge = parseInt(document.getElementById("max-age").value);
        const filteredData = crimeData.filter(d => d["Vict Age"] >= minAge && d["Vict Age"] <= maxAge);
        scenes[currentSceneIndex].render(filteredData);
    });
}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
});

// Function to hide filter buttons
function hideFilterButtons() {
    d3.select("#filter-buttons").style("display", "none");
}

// Function to show filter buttons
function showFilterButtons() {
    d3.select("#filter-buttons").style("display", "block");
}

function hideAgeFields() {
    d3.select("#age-filter").style("display", "none");
}

// Function to show filter buttons
function showAgeFields() {
    d3.select("#age-filter").style("display", "block");
}


const scenes = [
        {
        title: "Crime by Location",
        description: "Crimes by Location",
        annotation: "Examine how different crimes are more frequent in certain areas. Why might this be the case? See if you can find your neighborhood. What crime is most frequent where you live?",
        render: function(data) {
            d3.select("#scene-container").html("");
    
            showFilterButtons();
            hideAgeFields();

            d3.select("#scene-container")
                .append("h2")
                .text(this.title)
                .style("text-align", "center")
                .style("margin-bottom", "20px");

            d3.select("#scene-container")
                .append("p")
                .text(this.annotation)
                .style("text-align", "center")
                .style("margin-bottom", "20px");

    
            const locationCounts = d3.rollup(
                data,
                v => v.length,
                d => d['AREA NAME']
            );
    
            // Sort locations by frequency and get the top 20
            const sortedLocations = Array.from(locationCounts, ([key, value]) => ({ location: key, count: value }))
                .sort((a, b) => d3.descending(a.count, b.count));
    
            const top20Locations = sortedLocations.slice(0, 20).map(d => d.location);
            const otherLocations = sortedLocations.slice(20).map(d => d.location);
    
            // Add "Other" category
            const locationData = Array.from(d3.rollup(
                data.filter(d => otherLocations.includes(d['AREA NAME'])),
                v => v.length,
                d => 'Other'
            ), ([key, value]) => ({ location: key, count: value }));
    
            // Combine top 20 with "Other"
            top20Locations.forEach(location => {
                locationData.push({
                    location,
                    count: locationCounts.get(location)
                });
            });

            locationData.sort((a, b) => d3.descending(a.count, b.count));
    
            const width = 800;
            const height = 500;
            const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    
            const svg = d3.select("#scene-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
    
            const x = d3.scaleBand()
                .domain(locationData.map(d => d.location))
                .range([0, width])
                .padding(0.1);
    
            const y = d3.scaleLinear()
                .domain([0, 68000])
                .nice()
                .range([height, 0]);
    
            const xAxis = d3.axisBottom(x)
                .tickSize(0)
                .tickPadding(6);
    
            const yAxis = d3.axisLeft(y);
    
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text") // Rotate x-axis labels if needed
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");
    
            svg.append("g")
                .attr("class", "y-axis")
                .call(yAxis);
    
            const bars = svg.selectAll(".bar")
                .data(locationData);
    
            // Exit selection
            bars.exit()
                .transition()
                .duration(500)
                .attr("y", height)
                .attr("height", 0)
                .remove();
    
            // Update selection
            bars.transition()
                .duration(500)
                .attr("x", d => x(d.location))
                .attr("y", d => y(d.count))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.count));
    
            // Enter selection
            bars.enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.location))
                .attr("y", height)
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", "#69b3a2")
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(50)
                        .style("opacity", .9);
                    tooltip.html(`Location: ${d.location}<br>Crimes: ${d.count}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY + 5) + "px")
                        .style("width", "auto")
                        .style("height", "auto");
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY + 5) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .transition()
                .duration(500)
                .attr("y", d => y(d.count))
                .attr("height", d => height - y(d.count));
        }
    },
    {
        title: "Crime by Time of Year",
        description: "Total Crimes Per Month",
        annotation: "Examine how different crimes are more frequent in certain months. Why might this be the case? Recall the crime that was most frequent in your location, which month is it most likely to occur?",
        render: function(data) {
            d3.select("#scene-container").html("");
        
            d3.select("#scene-container")
                .append("h2")
                .text(this.title)
                .style("text-align", "center")
                .style("margin-bottom", "20px");
        
            // Parse the date and count crimes per month
            const parseDate = d3.timeParse("%m/%d/%Y %I:%M:%S %p");
            const crimesPerMonth = d3.rollup(
                data,
                v => v.length,
                d => d3.timeFormat("%Y-%m")(parseDate(d['DATE OCC']))
            );
        
            const crimeDataArray = Array.from(crimesPerMonth, ([key, value]) => ({ date: new Date(key), count: value }));
        
            const margin = { top: 20, right: 30, bottom: 60, left: 40 };
            const svg = d3.select("#scene-container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        
            
            
            // Set up scales
            const x = d3.scaleBand()
                .domain(crimeDataArray.map(d => d.date))
                .range([0, width])
                .paddingInner(0.5) 
                .paddingOuter(0.25);
        
            const y = d3.scaleLinear()
                .domain([0, 22000])
                .nice()
                .range([height, 0]);
        
            // Format x-axis ticks to match tooltip format
            const xAxis = d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%Y-%m"));
        
            // Add axes
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text") // Rotate the x-axis labels
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .attr("dy", "0.5em");
        
            svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));
        
            // Add bars
            const bars = svg.selectAll(".bar")
                .data(crimeDataArray);
        
            showFilterButtons();
            hideAgeFields();
        
            // Exit selection
            bars.exit()
                .transition()
                .duration(500)
                .attr("y", height)
                .attr("height", 0)
                .remove();
        
            // Update selection
            bars.transition()
                .duration(500)
                .attr("x", d => x(d.date))
                .attr("y", d => y(d.count))
                .attr("width", x.bandwidth() * 1.4)
                .attr("height", d => height - y(d.count));
        
            // Enter selection
            bars.enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.date))
                .attr("y", height)
                .attr("width", x.bandwidth() * 1.4)
                .attr("height", 0)
                .attr("fill", "#69b3a2")
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(50)
                        .style("opacity", .9);
                    tooltip.html(`Date: ${d3.timeFormat("%Y-%m")(d.date)}<br>Crimes: ${d.count}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY + 5) + "px")
                        .style("width", "auto")
                        .style("height", "auto");
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY + 5) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .transition()
                .duration(500)
                .attr("y", d => y(d.count))
                .attr("height", d => height - y(d.count));
        }
    },
    {
        title: "Victim Gender Distribution",
        description: "This is the third scene.",
        annotation: "Try filtering the data by age. What do you notice? Some age ranges skew heavily towards either gender, can you find them? Why might this be the case? For your age, are you more or less likely than the opposite gender to be a victim of a crime?",
        render: function(data) {
            // Clear the existing content
            d3.select("#scene-container").html("");

            hideFilterButtons();
            showAgeFields();
            //const dataGrouped = Array.from(d3.group(data, d => d["Vict Sex"]), ([key, value]) => ({ key, value: value.length }));


            d3.select("#scene-container")
                .append("h2")
                .text(this.title)
                .style("text-align", "center")
                .style("margin-bottom", "20px");

            d3.select("#scene-container")
                .append("p")
                .text(this.annotation)
                .style("text-align", "center")
                .style("margin-bottom", "20px");


            const width = 600;
            const height = 400;
            const margin = 40;
            const radius = Math.min(width, height) / 2 - margin;

            const svg = d3.select("#scene-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`);

            const pie = d3.pie()
                .value(d => d.value);

            //Filter out age 0 as these are not crimes that occured to people
            const filteredData = data.filter(d => d["Vict Age"] !== 0);

            const groupedData = d3.rollup(filteredData, v => v.length, d => {
                if (d["Vict Age"] !== 0){
                    if (d["Vict Sex"] === "M" || d["Vict Sex"] === "F"){
                        return d["Vict Sex"];
                    } else {
                        return "Other";
                    }
                }
            });
                
            // Convert the grouped data to an array of objects
            const dataGrouped = Array.from(groupedData, ([key, value]) => ({ key, value }));
                
            const dataReady = pie(dataGrouped);
                
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            const total = d3.sum(dataGrouped, d => d.value);

            const slices = svg.selectAll('slices')
                .data(dataReady)
                .enter()
                .append('g')
                .attr('class', 'slice');

            slices.append('path')
                .attr('d', arc)
                .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
                .attr("stroke", "white")
                .style("stroke-width", "2px")
                .style("opacity", 0.7)
                .on("mouseover", function(event, d) {
                    const percentage = ((d.data.value / total) * 100).toFixed(2);
                    d3.select("#tooltip")
                        .style("opacity", 1)
                        .html(`Key: ${d.data.key}<br>Percentage: ${percentage}%`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("#tooltip")
                        .style("opacity", 0);
                });
            

            slices.append('text')
                .text(d => d.data.key)
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .style("text-anchor", "middle")
                .style("font-size", 15);
            
        }
    }
];

let currentSceneIndex = 0;
let crimeData = [];

// Function to render the current scene
function renderScene(index) {
    scenes[index].render(crimeData);
}

// Event listeners for navigation buttons
document.getElementById("prev-button").addEventListener("click", function() {
    if (currentSceneIndex > 0) {
        currentSceneIndex--;
        renderScene(currentSceneIndex);
    }
});

document.getElementById("next-button").addEventListener("click", function() {
    if (currentSceneIndex < scenes.length - 1) {
        currentSceneIndex++;
        renderScene(currentSceneIndex);
    }
});