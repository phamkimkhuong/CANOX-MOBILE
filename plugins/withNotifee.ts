import * as ConfigPlugins from '@expo/config-plugins';
import { ConfigPlugin } from '@expo/config-plugins';

/**
 * Notifee requires a local Maven repository to be added to the project build.gradle.
 */
const withNotifeeRepository: ConfigPlugin = (config) => {
    return ConfigPlugins.withProjectBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = addNotifeeMavenRepository(config.modResults.contents);
        } else {
            throw new Error('Project build.gradle is not Groovy, but this plugin only supports Groovy.');
        }
        return config;
    });
};

function addNotifeeMavenRepository(buildGradle: string): string {
    const repository = `        maven { url "$rootDir/../node_modules/@notifee/react-native/android/libs" }`;

    if (buildGradle.includes(repository)) {
        return buildGradle;
    }

    // Find the allprojects -> repositories block
    const allProjectsRepoPattern = /allprojects\s*{\s*repositories\s*{/;
    if (allProjectsRepoPattern.test(buildGradle)) {
        return buildGradle.replace(
            allProjectsRepoPattern,
            `allprojects {
    repositories {
        ${repository}`
        );
    }

    return buildGradle;
}

export default withNotifeeRepository;
