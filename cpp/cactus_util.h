#ifndef cactus_util_H
#define cactus_util_H

#ifdef __cplusplus
extern "C" {
#endif

const char* register_app(const char* encrypted_data);

const char* get_device_id(const char* current_token);

// Helper function to free memory allocated by register_app
void free_string(const char* str);

#ifdef __ANDROID__
// Function to set the Android app data directory
// This should be called from Flutter/Java side before any other functions
void set_android_data_directory(const char* data_dir);
#endif

#ifdef __cplusplus
}
#endif

#endif
