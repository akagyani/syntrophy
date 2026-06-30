import { NextResponse } from "next/server";

/**
 * Returns predictive burnout and cognitive overload forecasts.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required query parameter: userId" },
        { status: 400 }
      );
    }

    // In production, this queries the user's calendars, bio-sensor data, and logs,
    // feeding them to the Risk Prediction Agent to compute cognitive overload probabilities.
    const riskForecast = [
      { day: "Mon", workload: 65, status: "stable" },
      { day: "Tue", workload: 85, status: "high-alert" },
      { day: "Wed", workload: 50, status: "stable" },
      { day: "Thu", workload: 40, status: "optimal" },
      { day: "Fri", workload: 30, status: "optimal" }
    ];

    return NextResponse.json({
      success: true,
      userId,
      burnoutIndex: 78,
      status: "High Alert",
      forecast: riskForecast,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Risk radar API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
