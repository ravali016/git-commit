import { useEffect, useState } from "react";
import logo from "./logo.svg";
import { Octokit } from "octokit";
import "./App.css";

function App() {
  const [personalAccessToken, setPersonalAccessToken] = useState("");
  const [commitDetils, setCommitDetails] = useState([]);
  const [commitError, setCommitError] = useState(false);
  const [commitShow, setCommitShow] = useState(false);
  useEffect(() => {
    if (localStorage.getItem("personalToken")) {
      setCommitShow(true);
      setPersonalAccessToken(localStorage.getItem("personalToken"));
      getCommitsFromApi(localStorage.getItem("personalToken"));
    }

    return () => {};
  }, []);
  const dateFormat = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      weekday: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true, // This is the line of code we care about here
      /*
          false: displays 24hs format for time
          true: displays 12, AM and PM format
      */
    };
    let date = new Date(dateString);
    let local = date.toLocaleDateString("en-US", options);
    return local;
  };
  const getCommitsFromApi = async (token) => {
    const octokit = new Octokit({
      auth: token,
    });
    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          owner: "ravali016",
          repo: "git-commit",
        }
      );
      const commitData = [];

      if (response.status === 200) {
        if (!localStorage.getItem("personalToken")) {
          localStorage.setItem("personalToken", personalAccessToken);
        }
        setCommitShow(true);
        response.data.map((item) => {
          console.log("test", item);
          const commitObj = {};
          commitObj.user = item.commit.author.name;
          commitObj.userAvatar = item.author?.avatar_url;
          commitObj.commitTime = item.commit.author.date;
          commitObj.commitMessage = item.commit.message;
          commitObj.commitUrl = item.html_url;
          commitData.push(commitObj);
        });

        setCommitDetails(commitData);
        setCommitError(false);
      } else {
        console.log("test", response);
        setCommitError(true);
        setCommitShow(false);
        localStorage.removeItem("personalToken");
      }
    } catch (e) {
      console.log("test", e);
      setCommitError(true);
      setCommitShow(false);
      localStorage.removeItem("personalToken");
    }
  };
  const getTokenInput = (e) => {
    console.log("test", e.target.value);
    setCommitError(false);
    setPersonalAccessToken(e.target.value);
  };
  const saveToken = async () => {
    if (personalAccessToken) {
      getCommitsFromApi(personalAccessToken);
    }
  };

  return (
    <div className="App">
      <h1 className="mainHeading">Git Commit History Tracking</h1>
      {!commitShow && (
        <div className="child">
          <label>Please enter Personal access token</label>
          <input
            type="text"
            value={personalAccessToken}
            onChange={getTokenInput}
          />
          <button disabled={!personalAccessToken} onClick={saveToken}>
            submit
          </button>
          {commitError && (
            <span className="error">Enter valid personal access token</span>
          )}
        </div>
      )}
      {commitShow &&
        commitDetils.length > 0 &&
        commitDetils.map((item, index) => {
          return (
            <div key={index} className="outerDiv">
              <h2 className="initialCommitMessage">
                {item.commitMessage}{" "}
                <span>
                  <img
                    src={item.userAvatar}
                    width={30}
                    height={30}
                    className="gitImage"
                    alt="gitImage"
                    title={item.user}
                  />
                </span>
              </h2>
              {/* <h2></h2> */}
              <p>
                {dateFormat(item.commitTime)} by{" "}
                <span className="userName">{item.user}</span>
              </p>
              <p className="commitLink">
                <a href={item.commitUrl} target="_blank" rel="noreferrer">
                  View the Commit on Github
                </a>
              </p>
            </div>
          );
        })}
    </div>
  );
}

export default App;
