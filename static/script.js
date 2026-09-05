// ======================================================
// SMARTYIELD AI - MAIN JAVASCRIPT
// ======================================================


// ======================================================
// GLOBAL SOIL IMAGE
// ======================================================

let selectedSoilFile = null;


// ======================================================
// GET FARM DATA
// ======================================================

function getFarmData() {

    return {

        crop: document.getElementById("crop").value,

        rainfall:
            parseFloat(document.getElementById("rainfall").value),

        temperature:
            parseFloat(document.getElementById("temperature").value),

        humidity:
            parseFloat(document.getElementById("humidity").value),

        soil_ph:
            parseFloat(document.getElementById("soil_ph").value),

        nitrogen:
            parseFloat(document.getElementById("nitrogen").value),

        phosphorus:
            parseFloat(document.getElementById("phosphorus").value),

        potassium:
            parseFloat(document.getElementById("potassium").value),

        irrigation:
            parseFloat(document.getElementById("irrigation").value)

    };

}



// ======================================================
// SOIL IMAGE SELECTION
// ======================================================

function handleSoilImage(input) {

    if (!input.files || input.files.length === 0) {

        return;

    }


    selectedSoilFile = input.files[0];


    const preview =
        document.getElementById("soilPreview");

    const container =
        document.getElementById("soilPreviewContainer");


    const reader = new FileReader();


    reader.onload = function(event) {

        preview.src = event.target.result;

        container.style.display = "block";


        document.getElementById("soilResult")
            .style.display = "none";

    };


    reader.readAsDataURL(selectedSoilFile);

}



// ======================================================
// SOIL ANALYSIS
// ======================================================

async function analyzeSoil() {

    if (!selectedSoilFile) {

        alert(
            "Please take a photo or import a soil picture first."
        );

        return;

    }


    const formData = new FormData();


    formData.append(
        "soilImage",
        selectedSoilFile
    );


    try {

        const response = await fetch(
            "/analyze_soil",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Soil analysis failed."
            );

            return;

        }


        // Soil condition

        document.getElementById(
            "soilCondition"
        ).textContent = data.condition;


        // Soil type

        document.getElementById(
            "soilType"
        ).textContent = data.soil_type;


        // Moisture

        document.getElementById(
            "soilMoisture"
        ).textContent = data.moisture;


        // Nitrogen

        document.getElementById(
            "soilNitrogen"
        ).textContent = data.nitrogen;


        // Phosphorus

        document.getElementById(
            "soilPhosphorus"
        ).textContent = data.phosphorus;


        // Potassium

        document.getElementById(
            "soilPotassium"
        ).textContent = data.potassium;


        // pH

        document.getElementById(
            "soilPH"
        ).textContent = data.ph;


        // Show result

        document.getElementById(
            "soilResult"
        ).style.display = "block";


    }
    catch (error) {

        console.error(
            "Soil analysis error:",
            error
        );


        alert(
            "Unable to connect to the soil analysis service."
        );

    }

}



// ======================================================
// USE SOIL VALUES
// ======================================================

function useSoilValues() {

    const nitrogen =
        document.getElementById(
            "soilNitrogen"
        ).textContent;


    const phosphorus =
        document.getElementById(
            "soilPhosphorus"
        ).textContent;


    const potassium =
        document.getElementById(
            "soilPotassium"
        ).textContent;


    const ph =
        document.getElementById(
            "soilPH"
        ).textContent;


    if (
        nitrogen === "--" ||
        phosphorus === "--" ||
        potassium === "--" ||
        ph === "--"
    ) {

        alert(
            "Please analyze the soil image first."
        );

        return;

    }


    document.getElementById(
        "nitrogen"
    ).value = nitrogen;


    document.getElementById(
        "phosphorus"
    ).value = phosphorus;


    document.getElementById(
        "potassium"
    ).value = potassium;


    document.getElementById(
        "soil_ph"
    ).value = ph;


    alert(
        "Soil values have been added to the Farm Information section."
    );


    // Scroll to farm information

    document.getElementById(
        "farmForm"
    ).scrollIntoView({
        behavior: "smooth"
    });

}



// ======================================================
// YIELD PREDICTION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        const farmForm =
            document.getElementById(
                "farmForm"
            );


        if (farmForm) {

            farmForm.addEventListener(
                "submit",
                async function(event) {

                    event.preventDefault();


                    const loading =
                        document.getElementById(
                            "loading"
                        );


                    const resultSection =
                        document.getElementById(
                            "resultSection"
                        );


                    loading.style.display =
                        "block";


                    resultSection.style.display =
                        "none";


                    const farmData =
                        getFarmData();


                    try {

                        const response =
                            await fetch(
                                "/predict",
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            farmData
                                        )
                                }
                            );


                        const data =
                            await response.json();


                        if (!response.ok) {

                            alert(
                                data.error ||
                                "Prediction failed."
                            );

                            return;

                        }


                        document.getElementById(
                            "yieldResult"
                        ).textContent =
                            Number(data.yield).toFixed(2)
                            + " t/ha";


                        document.getElementById(
                            "riskResult"
                        ).textContent =
                            data.risk;


                        resultSection.style.display =
                            "block";


                        // Calculate farm health

                        calculateHealth(
                            Number(data.yield)
                        );


                        // Recommendation

                        generateRecommendation(
                            Number(data.yield),
                            data.risk
                        );


                        resultSection.scrollIntoView({
                            behavior: "smooth"
                        });


                    }
                    catch (error) {

                        console.error(
                            "Prediction error:",
                            error
                        );


                        alert(
                            "Unable to connect to the AI prediction service."
                        );

                    }
                    finally {

                        loading.style.display =
                            "none";

                    }

                }
            );

        }


    }
);



// ======================================================
// SHAP EXPLANATION
// ======================================================

async function explainPrediction() {

    const explanationSection =
        document.getElementById(
            "explanationSection"
        );


    const explanationText =
        document.getElementById(
            "explanationText"
        );


    explanationSection.style.display =
        "block";


    explanationText.innerHTML =
        "<p>🔄 Generating AI explanation...</p>";


    const farmData =
        getFarmData();


    try {

        const response =
            await fetch(
                "/explain",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            farmData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            explanationText.innerHTML =
                "<p>❌ " +
                (
                    data.error ||
                    "Explanation unavailable."
                ) +
                "</p>";

            return;

        }


        if (
            !data.explanations ||
            data.explanations.length === 0
        ) {

            explanationText.innerHTML =
                "<p>No explanation available.</p>";

            return;

        }


        explanationText.innerHTML = "";


        data.explanations.forEach(
            function(item) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "explanation-item";


                let impactText;


                if (item.impact > 0) {

                    impactText =
                        "📈 Positive impact";

                }
                else {

                    impactText =
                        "📉 Negative impact";

                }


                div.innerHTML =
                    "<strong>" +
                    item.feature +
                    "</strong><br>" +
                    impactText +
                    " (" +
                    Number(item.impact)
                        .toFixed(3) +
                    ")";


                explanationText.appendChild(
                    div
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Explanation error:",
            error
        );


        explanationText.innerHTML =
            "<p>❌ AI explanation service is unavailable.</p>";

    }

}



// ======================================================
// WHAT-IF SIMULATION
// ======================================================

async function runSimulation() {

    const farmData =
        getFarmData();


    const nitrogen =
        parseFloat(
            document.getElementById(
                "simNitrogen"
            ).value
        );


    const irrigation =
        parseFloat(
            document.getElementById(
                "simIrrigation"
            ).value
        );


    const rainfall =
        parseFloat(
            document.getElementById(
                "simRainfall"
            ).value
        );


    farmData.nitrogen =
        nitrogen;


    farmData.irrigation =
        irrigation;


    farmData.rainfall =
        rainfall;


    const result =
        document.getElementById(
            "simYield"
        );


    result.textContent =
        "Calculating...";


    try {

        const response =
            await fetch(
                "/simulate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            farmData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            result.textContent =
                "Error";

            alert(
                data.error ||
                "Simulation failed."
            );

            return;

        }


        result.textContent =
            Number(data.yield).toFixed(2)
            + " t/ha";


    }
    catch (error) {

        console.error(
            "Simulation error:",
            error
        );


        result.textContent =
            "Unavailable";

    }

}



// ======================================================
// FARM OPTIMIZATION
// ======================================================

async function optimizeFarm() {

    const result =
        document.getElementById(
            "optimizationText"
        );


    result.innerHTML =
        "<p>🔄 AI is searching for the best farming conditions...</p>";


    const farmData =
        getFarmData();


    try {

        const response =
            await fetch(
                "/optimize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            farmData
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            result.innerHTML =
                "<p>❌ " +
                (
                    data.error ||
                    "Optimization failed."
                ) +
                "</p>";

            return;

        }


        result.innerHTML =

            "<h3>🎯 Best Farming Plan</h3>" +

            "<p>" +
            "<strong>Expected Yield:</strong> " +
            Number(data.best_yield)
                .toFixed(2) +
            " t/ha" +
            "</p>" +

            "<p>" +
            "<strong>Recommended Nitrogen:</strong> " +
            data.nitrogen +
            "</p>" +

            "<p>" +
            "<strong>Recommended Irrigation:</strong> " +
            data.irrigation +
            "%</p>" +

            "<p>" +
            "<strong>Recommended Rainfall:</strong> " +
            data.rainfall +
            " mm</p>";


    }
    catch (error) {

        console.error(
            "Optimization error:",
            error
        );


        result.innerHTML =
            "<p>❌ Optimization service unavailable.</p>";

    }

}



// ======================================================
// PROFIT CALCULATOR
// ======================================================

function calculateProfit() {

    const farmArea =
        parseFloat(
            document.getElementById(
                "farmArea"
            ).value
        );


    const price =
        parseFloat(
            document.getElementById(
                "price"
            ).value
        );


    const fertilizerCost =
        parseFloat(
            document.getElementById(
                "fertilizerCost"
            ).value
        ) || 0;


    const irrigationCost =
        parseFloat(
            document.getElementById(
                "irrigationCost"
            ).value
        ) || 0;


    const laborCost =
        parseFloat(
            document.getElementById(
                "laborCost"
            ).value
        ) || 0;


    const otherCost =
        parseFloat(
            document.getElementById(
                "otherCost"
            ).value
        ) || 0;


    const yieldText =
        document.getElementById(
            "yieldResult"
        ).textContent;


    const predictedYield =
        parseFloat(
            yieldText
        );


    if (
        isNaN(farmArea) ||
        isNaN(price) ||
        isNaN(predictedYield)
    ) {

        alert(
            "Please enter farm area, crop price and complete yield prediction first."
        );

        return;

    }


    // Convert acres to hectares

    const hectares =
        farmArea / 2.471;


    // Yield is tonnes per hectare

    const productionTonnes =
        predictedYield * hectares;


    // Convert tonnes to kilograms

    const productionKg =
        productionTonnes * 1000;


    // Revenue

    const revenue =
        productionKg * price;


    // Total farming cost

    const totalCost =
        fertilizerCost +
        irrigationCost +
        laborCost +
        otherCost;


    // Actual profit

    const profit =
        revenue -
        totalCost;


    document.getElementById(
        "production"
    ).textContent =
        productionKg.toFixed(2)
        + " kg";


    document.getElementById(
        "revenue"
    ).textContent =
        "₹ " +
        revenue.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "totalCost"
    ).textContent =
        "₹ " +
        totalCost.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "profit"
    ).textContent =
        "₹ " +
        profit.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}



// ======================================================
// FARM HEALTH
// ======================================================

function calculateHealth(predictedYield) {

    const soilPH =
        parseFloat(
            document.getElementById(
                "soil_ph"
            ).value
        );


    const nitrogen =
        parseFloat(
            document.getElementById(
                "nitrogen"
            ).value
        );


    const irrigation =
        parseFloat(
            document.getElementById(
                "irrigation"
            ).value
        );


    const humidity =
        parseFloat(
            document.getElementById(
                "humidity"
            ).value
        );


    let score = 0;


    // Yield score

    if (predictedYield >= 4) {

        score += 30;

    }
    else if (predictedYield >= 3) {

        score += 23;

    }
    else {

        score += 15;

    }


    // Soil pH

    if (
        soilPH >= 6 &&
        soilPH <= 7.5
    ) {

        score += 20;

    }
    else {

        score += 10;

    }


    // Nitrogen

    if (
        nitrogen >= 50 &&
        nitrogen <= 100
    ) {

        score += 20;

    }
    else {

        score += 10;

    }


    // Irrigation

    if (
        irrigation >= 50 &&
        irrigation <= 90
    ) {

        score += 15;

    }
    else {

        score += 8;

    }


    // Humidity

    if (
        humidity >= 50 &&
        humidity <= 85
    ) {

        score += 15;

    }
    else {

        score += 8;

    }


    score =
        Math.min(
            100,
            Math.round(score)
        );


    document.getElementById(
        "healthScore"
    ).textContent =
        score;


    let message;


    if (score >= 80) {

        message =
            "🌱 Excellent farm condition. Your farming conditions are favorable.";

    }
    else if (score >= 60) {

        message =
            "🌿 Good farm condition. Some improvements can increase productivity.";

    }
    else {

        message =
            "⚠️ Farm condition needs attention. Consider improving soil and resource management.";

    }


    document.getElementById(
        "healthMessage"
    ).textContent =
        message;

}



// ======================================================
// SMART RECOMMENDATION
// ======================================================

function generateRecommendation(
    predictedYield,
    risk
) {

    const nitrogen =
        parseFloat(
            document.getElementById(
                "nitrogen"
            ).value
        );


    const irrigation =
        parseFloat(
            document.getElementById(
                "irrigation"
            ).value
        );


    const soilPH =
        parseFloat(
            document.getElementById(
                "soil_ph"
            ).value
        );


    let recommendations = [];


    if (nitrogen < 50) {

        recommendations.push(
            "Increase nitrogen availability through balanced fertilizer application."
        );

    }
    else if (nitrogen > 100) {

        recommendations.push(
            "Avoid excessive nitrogen application to reduce fertilizer wastage."
        );

    }
    else {

        recommendations.push(
            "Nitrogen level is within a reasonable range."
        );

    }


    if (irrigation < 50) {

        recommendations.push(
            "Consider increasing irrigation if water is available and the crop requires it."
        );

    }
    else if (irrigation > 90) {

        recommendations.push(
            "Avoid excessive irrigation and monitor soil moisture."
        );

    }
    else {

        recommendations.push(
            "Irrigation level appears suitable for the current simulation."
        );

    }


    if (
        soilPH < 6 ||
        soilPH > 7.5
    ) {

        recommendations.push(
            "Soil pH may need correction based on the crop requirement."
        );

    }
    else {

        recommendations.push(
            "Soil pH is within a favorable range."
        );

    }


    if (predictedYield < 3) {

        recommendations.push(
            "Yield risk is relatively high. Review soil, irrigation and weather conditions."
        );

    }


    if (risk === "Medium Risk") {

        recommendations.push(
            "Monitor the farm regularly because environmental changes may affect yield."
        );

    }


    if (risk === "Low Risk") {

        recommendations.push(
            "Current conditions are favorable. Continue monitoring resources efficiently."
        );

    }


    const recommendationBox =
        document.getElementById(
            "recommendation"
        );


    recommendationBox.innerHTML =
        "<ul>" +
        recommendations
            .map(
                item =>
                    "<li>" +
                    item +
                    "</li>"
            )
            .join("") +
        "</ul>";

}



// ======================================================
// INITIAL PAGE SETTINGS
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const resultSection =
            document.getElementById(
                "resultSection"
            );


        const explanationSection =
            document.getElementById(
                "explanationSection"
            );


        if (resultSection) {

            resultSection.style.display =
                "none";

        }


        if (explanationSection) {

            explanationSection.style.display =
                "none";

        }

    }
);