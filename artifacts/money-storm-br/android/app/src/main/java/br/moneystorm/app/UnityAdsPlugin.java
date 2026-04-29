package br.moneystorm.app;

import android.app.Activity;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

@CapacitorPlugin(name = "UnityAdsPlugin")
public class UnityAdsPlugin extends Plugin
        implements IUnityAdsInitializationListener {

    private static final String TAG = "UnityAdsPlugin";
    private boolean initialized = false;

    // ── initialize ────────────────────────────────────────────────────────────
    @PluginMethod
    public void initialize(PluginCall call) {
        String gameId   = call.getString("gameId", "6099759");
        boolean testMode = Boolean.TRUE.equals(call.getBoolean("testMode", false));

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        Log.d(TAG, "Initializing Unity Ads — gameId=" + gameId + " testMode=" + testMode);
        UnityAds.initialize(activity, gameId, testMode, this);
        // Resolve immediately; listen for real readiness via isReady / callbacks
        call.resolve();
    }

    // ── loadAd ───────────────────────────────────────────────────────────────
    @PluginMethod
    public void loadAd(PluginCall call) {
        String placementId = call.getString("placementId", "Rewarded_Android");

        UnityAds.load(placementId, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(String pid) {
                Log.d(TAG, "Ad loaded: " + pid);
                JSObject result = new JSObject();
                result.put("loaded", true);
                result.put("placementId", pid);
                call.resolve(result);
            }

            @Override
            public void onUnityAdsFailedToLoad(String pid,
                    UnityAds.UnityAdsLoadError error, String message) {
                Log.w(TAG, "Ad failed to load: " + pid + " — " + message);
                call.reject("LOAD_FAILED: " + message, String.valueOf(error));
            }
        });
    }

    // ── showAd ───────────────────────────────────────────────────────────────
    @PluginMethod
    public void showAd(PluginCall call) {
        String placementId = call.getString("placementId", "Rewarded_Android");
        Activity activity  = getActivity();

        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        UnityAds.show(activity, placementId, new UnityAdsShowOptions(),
                new IUnityAdsShowListener() {
                    @Override
                    public void onUnityAdsShowFailure(String pid,
                            UnityAds.UnityAdsShowError error, String message) {
                        Log.w(TAG, "Show failed: " + message);
                        call.reject("SHOW_FAILED: " + message, String.valueOf(error));
                    }

                    @Override public void onUnityAdsShowStart(String pid) {
                        Log.d(TAG, "Show started: " + pid);
                    }

                    @Override public void onUnityAdsShowClick(String pid) {
                        Log.d(TAG, "Ad clicked: " + pid);
                    }

                    @Override
                    public void onUnityAdsShowComplete(String pid,
                            UnityAds.UnityAdsShowCompletionState state) {
                        Log.d(TAG, "Show complete: " + pid + " state=" + state);
                        JSObject result = new JSObject();
                        result.put("placementId", pid);
                        result.put("state", state.toString()); // COMPLETED or SKIPPED
                        call.resolve(result);
                    }
                });
    }

    // ── isReady ──────────────────────────────────────────────────────────────
    @PluginMethod
    public void isReady(PluginCall call) {
        JSObject result = new JSObject();
        result.put("ready", initialized);
        call.resolve(result);
    }

    // ── IUnityAdsInitializationListener ──────────────────────────────────────
    @Override
    public void onInitializationComplete() {
        Log.d(TAG, "Unity Ads initialized successfully");
        initialized = true;
        JSObject data = new JSObject();
        data.put("initialized", true);
        notifyListeners("onInitialized", data);
    }

    @Override
    public void onInitializationFailed(UnityAds.UnityAdsInitializationError error,
            String message) {
        Log.e(TAG, "Unity Ads initialization failed: " + message);
        initialized = false;
        JSObject data = new JSObject();
        data.put("initialized", false);
        data.put("error", message);
        notifyListeners("onInitialized", data);
    }
}
