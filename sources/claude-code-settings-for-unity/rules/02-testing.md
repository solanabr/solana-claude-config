---
paths:
  - "**/Tests/**/*.cs"
---

# Testing Guidelines

## Basic Principles

- ユニットテストは小さく、高速で、独立していること
  - 各テストは1つの機能や動作のみをテストする
  - テスト間の依存関係を避ける
- テストはドキュメントとしての役割も果たす
  - テスト名は「何をテストするか」を明確に示す
  - テストコードは実装の使用例としても機能する
- 依存オブジェクトがあるケースでも、可能な限り本物のプロダクトコードを使ってテストする。やむを得ないときのみテストダブルを使用する

## Structure

- テスト対象が Editor/ ディレクトリ下にある場合（エディタ拡張の場合）、テストコードは `Tests/Editor/` 下に置く（Edit Mode tests）
- テスト対象が Runtime/ ディレクトリ下にある場合、テストコードは `Tests/Runtime/` 下に置く（Play Mode tests）
- テスト対象クラスと対となるディレクトリ構造およびテストクラスを作成する
- テストコード内で使用するTest double (Stub, Spy, Dummy, Fake, Mock) クラスを作る場合は、`Tests/Editor/TestDoubles/` もしくは `Tests/Runtime/TestDoubles/` ディレクトリに置く
- テストコード内で使用するSceneファイルを作る場合は、`Tests/Scenes/` ディレクトリに置く

## Naming

- テストアセンブリ名は、テスト対象アセンブリ名 + ".Tests" とする
- テストコードの名前空間は、テスト対象と同一とする
- テストクラス名は テスト対象クラス名 + "Test" とする。e.g., `public class CharacterControllerTest`
- テストメソッド名は「テスト対象メソッド名」「条件」「期待される結果」をアンダースコアで連結した形式を使用する。e.g., `public void TakeDamage_WhenHealthIsZero_CharacterDies()`
- テスト対象オブジェクトには`sut`、実測値には`actual`、期待値には`expected`と命名し、役割を明示すること
- テストダブルを使用する場合、xUnit Test Patterns (xUTP) の定義に従って `stub`, `spy`, `dummy`, `fake`, `mock` のいずれかの接頭辞を使用すること

## Design

- テストにはNUnit3ベースのUnity Test Frameworkを使用する。See: https://docs.unity3d.com/Packages/com.unity.test-framework@1.4/manual/index.html
- テストクラスには `TestFixture` 属性をつけること
- テストメソッドの構造
  - Arrange, Act, Assert のパターンに従う
  - 各セクションの間を空行で区切ること。コメントは不要
- Assertは1つのテストメソッドにつき、1つのみとする
- Assertには制約モデル（`Assert.That`）を使用する。ドキュメントを参照して、最適な制約を使用すること。See: https://docs.nunit.org/api/NUnit.Framework.Constraints.html
- `Assert.That` の 引数 `message` は指定しない。テスト名と制約で十分に意図が伝わるようにすること
- テストコードはシンプルなシングルパスであること
  - Never use `if`, `switch`, `for`, `foreach`, and the ternary operator in test code.
- Parameterized tests を積極的に使用する
  - Arrangeが異なりActとAssertが同じテストは、`TestCase`, `TestCaseSource`, `Values`, `ValueSource` 属性を使用してパラメータ化できる
  - `ParametrizedIgnore` 属性で組み合わせの除外もできる
- テストで使用するオブジェクトの生成は、creation method pattern を積極的に使用すること。e.g., `private GameObject CreateSystemUnderTestObject()`
  - `TearDown` でリソースを開放するために private field に保持する場合でも、テストメソッドでは常に creation method の戻り値を使用する
- 各テストは独立して実行できること。他のテストの実行結果に依存しない
- テスト中に `GameObject` を生成する場合、テストメソッドに `CreateScene` 属性をつけること。もしすでに `LoadScene` 属性がついていれば不要
- 安易に`LogAssert`によるログメッセージの検証は避け、必要ならばSpyを作成して使用すること
- 非同期テストでは、むやみに `Delay`, `Wait` による指定時間待機を使用しないこと。1フレーム待つだけなら `yield return null` を使用できる
- 非同期メソッドで例外がスローされることを検証する場合、`Throws` 制約ではなく、try-catchブロックを使用して、例外が発生することを確認する（Unity Test Frameworkの制限事項）
    ```csharp
    try
    {
        await Foo.Bar(-1);
        Assert.Fail("例外が出ることを期待しているのでテスト失敗とする");
    }
    catch (ArgumentException expectedException)
    {
        Assert.That(expectedException.Message, Is.EqualTo("Semper Paratus!"));
    }
    ```

## コメント

- テストコードには XML Documentation Comments は不要

## テスト実行

- テスト実行前に、Unity editorでコンパイルエラーが出ていないことを確認すること
- テストの実行は、MCP経由でUnity editor上のTest Runnerで行なう
- フィルタを積極的に指定して、実行するテスト数を最小限にすること。Namingセクションで定めたネーミングルールを利用できる

## テスト実行結果の解釈

テスト実行結果は次の基準で解釈する

- Passed: テスト成功
- Failed: テスト失敗。原因調査と修正が必要
- Inconclusive: テストの前提条件が満たせない。失敗と同様に扱う
- Skipped: スキップ指定されているテスト。無視してよい

失敗したテストには次の手順で対処する

1. エラーメッセージを確認して原因を特定 
2. 期待値と実際の値の差異を分析 
3. 修正後、同じテストを再実行して確認 
4. 連続して失敗する場合は、テストコードと実装の両方を見直す 
5. 2連続で失敗する場合、状況を整理してユーザーに指示を仰ぐ
