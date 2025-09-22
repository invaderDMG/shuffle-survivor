# Debugging Guide

## Common Issues and Solutions

### 1. "Setting up device..." stuck state

**Symptoms:**
- App gets stuck on "Setting up device..." message
- No progress after Spotify login

**Debug Steps:**
1. Open browser dev tools and check console for debug messages
2. Look for `[ShuffleSurvivor]` prefixed messages
3. Check if `device_id` is set in sessionStorage
4. Verify Spotify Web Playback SDK is loading

**Solutions:**
- Wait up to 10 seconds for device setup
- If stuck, refresh the page
- Check browser console for Spotify SDK errors
- Ensure Spotify app is open and playing music

### 2. App crashes on refresh

**Symptoms:**
- App works initially but crashes when refreshed
- Console shows initialization errors

**Debug Steps:**
1. Check for duplicate SDK initialization
2. Look for sessionStorage conflicts
3. Verify global flags are being cleared

**Solutions:**
- The app now has automatic cleanup of old flags
- If issues persist, clear browser data and try again
- Check for multiple tabs with the app open

### 3. Playlist loading fails

**Symptoms:**
- Error message about playlist loading
- "Failed to load playlists" error

**Debug Steps:**
1. Check if access token is valid
2. Verify Spotify API permissions
3. Look for network errors in dev tools

**Solutions:**
- Re-login to Spotify
- Check internet connection
- Verify Spotify account has playlists

## Debug Information

In development mode, the app shows debug information including:
- Token status
- Player connection status
- Device ID
- Playlist URI
- Game status
- Initialization status

## Manual Reset

If all else fails:
1. Clear browser sessionStorage
2. Refresh the page
3. Re-login to Spotify
4. Try again

## Console Commands

You can manually check state in browser console:

```javascript
// Check session storage
console.log('Token:', sessionStorage.getItem('access_token'));
console.log('Device ID:', sessionStorage.getItem('device_id'));
console.log('Playlist:', sessionStorage.getItem('playlist_name'));

// Clear everything
sessionStorage.clear();
```
