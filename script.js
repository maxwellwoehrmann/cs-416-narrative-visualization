// Define scenes
const scenes = [
    {
        title: "Scene 1",
        description: "This is the first scene.",
        render: function() {
            d3.select("#scene-container").html("");
            d3.select("#scene-container")
                .append("svg")
                .attr("width", 600)
                .attr("height", 400)
                .append("circle")
                .attr("cx", 300)
                .attr("cy", 200)
                .attr("r", 50)
                .style("fill", "blue");
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

// Function to render the current scene
function renderScene(index) {
    scenes[index].render();
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

// Initial render
renderScene(currentSceneIndex);