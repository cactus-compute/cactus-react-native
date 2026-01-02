project(cactus)
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME cactus)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
    src/main/cpp/cpp-adapter.cpp
    ../cpp/HybridCactus.cpp
    ../cpp/HybridCactusUtil.cpp
    ../cpp/HybridCactusIndex.cpp
)

add_library(libcactus STATIC IMPORTED)
set_target_properties(libcactus PROPERTIES
    IMPORTED_LOCATION "${CMAKE_CURRENT_LIST_DIR}/src/main/jniLibs/${ANDROID_ABI}/libcactus.a"
)

add_library(libcactus_util STATIC IMPORTED)
set_target_properties(libcactus_util PROPERTIES
    IMPORTED_LOCATION "${CMAKE_CURRENT_LIST_DIR}/src/main/jniLibs/${ANDROID_ABI}/libcactus_util.a"
)

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/cactus+autolinking.cmake)

# Set up local includes
include_directories("src/main/cpp" "../cpp")

find_library(LOG_LIB log)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        android # <-- Android core
        libcactus
        libcactus_util
)
