var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class GameSDKError extends Error {
  constructor(code, message, details) {
    super(message);
    __publicField(this, "code");
    __publicField(this, "details");
    this.name = "GameSDKError";
    this.code = code;
    this.details = details;
  }
}
const DEFAULT_TIMEOUT = 3e4;
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
class GameSDK {
  constructor(config) {
    __publicField(this, "config");
    __publicField(this, "pendingRequests", /* @__PURE__ */ new Map());
    __publicField(this, "isReady", false);
    __publicField(this, "readyCallbacks", []);
    __publicField(this, "ai", {
      generateText: (prompt, options) => this.generateText(prompt, options),
      generateImage: (prompt, options) => this.generateImage(prompt, options)
    });
    __publicField(this, "storage", {
      save: (key, value) => this.storageSave(key, value),
      load: (key) => this.storageLoad(key),
      clear: () => this.storageClear()
    });
    __publicField(this, "analytics", {
      track: (event, data) => this.trackEvent(event, data)
    });
    __publicField(this, "leaderboard", {
      submitScore: (score, extraData) => this.submitScore(score, extraData),
      getRanking: (type, limit) => this.getRanking(type, limit)
    });
    this.config = {
      origin: window.location.origin,
      timeout: DEFAULT_TIMEOUT,
      ...config
    };
    this.setupMessageListener();
  }
  setupMessageListener() {
    window.addEventListener("message", this.handleMessage.bind(this));
  }
  handleMessage(event) {
    if (event.data && typeof event.data === "object" && event.data.type) {
      const message = event.data;
      if (message.type === "sdk:ready") {
        this.isReady = true;
        this.readyCallbacks.forEach((cb) => cb());
        this.readyCallbacks = [];
        return;
      }
      if (message.requestId && this.pendingRequests.has(message.requestId)) {
        const pending = this.pendingRequests.get(message.requestId);
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(message.requestId);
        if (message.type.includes(":response")) {
          pending.resolve(message.payload);
        } else if (message.type === "sdk:error" || message.error) {
          pending.reject(
            new GameSDKError("REQUEST_FAILED", message.error || "Request failed", message.payload)
          );
        }
      }
    }
  }
  sendMessage(type, payload) {
    return new Promise((resolve, reject) => {
      const requestId = generateRequestId();
      const message = {
        type,
        requestId,
        payload
      };
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new GameSDKError("TIMEOUT", `Request timed out: ${type}`));
      }, this.config.timeout);
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });
      window.parent.postMessage(message, this.config.origin || "*");
    });
  }
  onReady(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }
  async getUser() {
    try {
      return await this.sendMessage("sdk:getUser");
    } catch (error) {
      throw new GameSDKError("GET_USER_FAILED", "Failed to get user info", error);
    }
  }
  async generateText(prompt, options) {
    try {
      const response = await this.sendMessage("sdk:generateText", {
        prompt,
        options
      });
      return response.result;
    } catch (error) {
      throw new GameSDKError("GENERATE_TEXT_FAILED", "Failed to generate text", error);
    }
  }
  async generateImage(prompt, options) {
    try {
      const response = await this.sendMessage("sdk:generateImage", {
        prompt,
        options
      });
      return response.url;
    } catch (error) {
      throw new GameSDKError("GENERATE_IMAGE_FAILED", "Failed to generate image", error);
    }
  }
  async storageSave(key, value) {
    try {
      await this.sendMessage("sdk:storage:save", { key, value });
    } catch (error) {
      throw new GameSDKError("STORAGE_SAVE_FAILED", "Failed to save data", error);
    }
  }
  async storageLoad(key) {
    try {
      const response = await this.sendMessage("sdk:storage:load", { key });
      return (response == null ? void 0 : response.value) ?? null;
    } catch (error) {
      throw new GameSDKError("STORAGE_LOAD_FAILED", "Failed to load data", error);
    }
  }
  async storageClear() {
    try {
      await this.sendMessage("sdk:storage:clear");
    } catch (error) {
      throw new GameSDKError("STORAGE_CLEAR_FAILED", "Failed to clear storage", error);
    }
  }
  async trackEvent(event, data) {
    try {
      await this.sendMessage("sdk:analytics:track", { event, data });
    } catch (error) {
      console.warn("[GameSDK] Analytics track failed:", error);
    }
  }
  async submitScore(score, extraData) {
    try {
      await this.sendMessage("sdk:leaderboard:submitScore", { score, extraData });
    } catch (error) {
      throw new GameSDKError("SUBMIT_SCORE_FAILED", "Failed to submit score", error);
    }
  }
  async getRanking(type, limit) {
    try {
      const response = await this.sendMessage("sdk:leaderboard:getRanking", {
        type: type || "global",
        limit: limit || 100
      });
      return response;
    } catch (error) {
      throw new GameSDKError("GET_RANKING_FAILED", "Failed to get ranking", error);
    }
  }
  destroy() {
    window.removeEventListener("message", this.handleMessage.bind(this));
    this.pendingRequests.forEach(({ timeout }) => clearTimeout(timeout));
    this.pendingRequests.clear();
    this.readyCallbacks = [];
  }
}
function createGameSDK(config) {
  return new GameSDK(config);
}
export {
  GameSDK,
  GameSDKError,
  createGameSDK
};
//# sourceMappingURL=game-sdk.es.js.map
