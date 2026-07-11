// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "WebblockerPlugin",
    platforms: [.iOS(.v16)],
    products: [
        .library(
            name: "WebblockerPlugin",
            targets: ["WebBlockerPluginPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "WebBlockerPluginPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/WebBlockerPluginPlugin",
            resources: [.copy("BlockedDomains.json")]),
        .testTarget(
            name: "WebBlockerPluginPluginTests",
            dependencies: ["WebBlockerPluginPlugin"],
            path: "ios/Tests/WebBlockerPluginPluginTests")
    ]
)