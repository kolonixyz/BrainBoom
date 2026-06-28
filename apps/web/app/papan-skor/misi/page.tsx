import { AppContainer } from "../../../components/layout/AppContainer";
import { ProjectTab } from "../../../components/project/ProjectTab";

export default function MisiPage() {
    return (
        <AppContainer>
            <div className="h-full">
                <ProjectTab />
            </div>
        </AppContainer>
    );
}
