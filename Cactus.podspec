require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Cactus"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/cactus-compute/cactus-react-native.git", :tag => "#{s.version}" }


  s.source_files = [
    "ios/**/*.{swift}",
    "ios/**/*.{m,mm}",
    "cpp/**/*.{h,hpp,cpp}",
  ]

  s.vendored_frameworks = ["ios/cactus.xcframework"]

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
 
  s.dependency 'ZIPFoundation', '~> 0.9'

  load 'nitrogen/generated/ios/Cactus+autolinking.rb'
  add_nitrogen_files(s)

  install_modules_dependencies(s)
end
