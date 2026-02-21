project(cactus)
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME cactus)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
    src/main/cpp/cpp-adapter.cpp
    ../cpp/HybridCactus.cpp
    ../cpp/HybridCactusIndex.cpp
)

add_library(libcactus STATIC IMPORTED)
set_target_properties(libcactus PROPERTIES
    IMPORTED_LOCATION "${CMAKE_CURRENT_LIST_DIR}/src/main/jniLibs/${ANDROID_ABI}/libcactus.a"
)

set(JNILIBS_DIR "${CMAKE_CURRENT_LIST_DIR}/src/main/jniLibs/${ANDROID_ABI}")

add_library(libcurl STATIC IMPORTED)
set_target_properties(libcurl PROPERTIES
    IMPORTED_LOCATION "${JNILIBS_DIR}/libcurl.a"
)

add_library(libmbedtls STATIC IMPORTED)
set_target_properties(libmbedtls PROPERTIES
    IMPORTED_LOCATION "${JNILIBS_DIR}/libmbedtls.a"
)

add_library(libmbedx509 STATIC IMPORTED)
set_target_properties(libmbedx509 PROPERTIES
    IMPORTED_LOCATION "${JNILIBS_DIR}/libmbedx509.a"
)

add_library(libmbedcrypto STATIC IMPORTED)
set_target_properties(libmbedcrypto PROPERTIES
    IMPORTED_LOCATION "${JNILIBS_DIR}/libmbedcrypto.a"
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
        libcurl
        libmbedtls
        libmbedx509
        libmbedcrypto
)
