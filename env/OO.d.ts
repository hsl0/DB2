// OOjs 모듈을 불러왔을 때 window에 생성되는 OO 네임스페이스
declare namespace OO {
    function inheritClass(
        targetFn: { new (...args: any[]): Object },
        originFn: { new (...args: any[]): Object }
    ): void;
    namespace ui {
        class ProcessDialog {
            
        }
    }
}