const CLIENT_ID = "8b65eb67281f408a8ecffbf60e1b9152";
const REDIRECT_URI = "https://magenta-biscotti.vercel.app";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-top-read",
  "user-read-private",
  "user-read-email",
  "user-read-recently-played",
].join(" ");

export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;

  // Extract the token from the URL hash

  if (hash) {
    const token = hash
      .substring(1)
      .split("&")
      .find((elem) => elem.startsWith("access_token"))
      ?.split("=")[1];

    if (token) {
      localStorage.setItem("spotify_access_token", token);
      window.location.hash = ""; // Clear the hash after storing the token
      return token;
    }
  }

  // Check localStorage if no hash is present
  const storedToken = localStorage.getItem("spotify_access_token");
  return storedToken || null;
};

export const fetchTopItems = async <T>(
  type: "artists" | "tracks",
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term",
  token: string
): Promise<{ items: T[]; total: number; limit: number; offset: number }> => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(
          "Access token is invalid or expired. Redirecting to login."
        );
        localStorage.removeItem("spotify_access_token");
        window.location.href = "/";
      }
      throw new Error(`Failed to fetch top ${type}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching top ${type}:`, error);
    throw error;
  }
};

export const fetchRecentlyPlayed = async (
  token: string
): Promise<{ items: PlayHistory[] }> => {
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.warn(
          "Access token is invalid or expired. Redirecting to login."
        );
        localStorage.removeItem("spotify_access_token");
        window.location.href = "/";
      }
      throw new Error(
        `Failed to fetch recently played: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching recently played:", error);
    throw error;
  }
};
