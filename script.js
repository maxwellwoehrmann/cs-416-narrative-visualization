d3.csv("crime-data.csv").then(function(data) {
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
}).catch(function(error) {
    console.error("Error loading the CSV file:", error);
});

const scenes = [
    {
        title: "Scene 1",
        description: "Total Crimes Per Month",
        render: function(data) {
            d3.select("#scene-container").html("");

            // Parse the date and count crimes per month
            const parseDate = d3.timeParse("%m/%d/%Y %I:%M:%S %p");
            const crimesPerMonth = d3.rollup(
                data,
                v => v.length,
                d => d3.timeFormat("%Y-%m")(parseDate(d['DATE OCC']))
            );

            const crimeDataArray = Array.from(crimesPerMonth, ([key, value]) => ({ date: new Date(key), count: value }));

            // Set up the SVG canvas dimensions
            const margin = { top: 20, right: 30, bottom: 30, left: 40 };
            const width = 900 - margin.left - margin.right;
            const height = 600 - margin.top - margin.bottom;

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
                .range([height, 0]);

            const xAxis = d3.axisBottom(x)
                .tickFormat(d3.timeFormat("%m/%d"))

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
            svg.selectAll(".bar")
                .data(crimeDataArray)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.date))
                .attr("y", d => y(d.count))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.count))
                .attr("fill", "#69b3a2");
        }
    },
    {
        title: "Scene 2",
        description: "This is the second scene.",
        render: function() {
            d3.select("#scene-container").html("");
            d3.select("#scene-container")
                .append("svg")
                .attr("width", 600)
                .attr("height", 400)
                .append("rect")
                .attr("x", 250)
                .attr("y", 150)
                .attr("width", 100)
                .attr("height", 100)
                .style("fill", "green");
        }
    },
    {
        title: "Scene 3",
        description: "This is the third scene.",
        render: function() {
            d3.select("#scene-container").html("");
            d3.select("#scene-container")
                .append("svg")
                .attr("width", 600)
                .attr("height", 400)
                .append("text")
                .attr("x", 300)
                .attr("y", 200)
                .attr("text-anchor", "middle")
                .style("font-size", "24px")
                .text("Hello, D3.js!");
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