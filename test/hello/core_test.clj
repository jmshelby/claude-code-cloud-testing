(ns hello.core-test
  (:require [clojure.string :as str]
            [clojure.test :refer [deftest is testing]]
            [hello.core :refer [greet cli-options]]
            [clojure.tools.cli :refer [parse-opts]]))

(deftest greet-test
  (testing "greets with provided name"
    (is (= "Hello, Alice!\n"
           (with-out-str (greet "Alice" false)))))

  (testing "greets World by default"
    (is (= "Hello, World!\n"
           (with-out-str (greet "World" false)))))

  (testing "prints verbose message when enabled"
    (is (str/includes?
         (with-out-str (greet "Bob" true))
         "Verbose mode enabled"))))

(deftest cli-options-test
  (testing "defaults name to World"
    (let [{:keys [options]} (parse-opts [] cli-options)]
      (is (= "World" (:name options)))))

  (testing "parses --name flag"
    (let [{:keys [options]} (parse-opts ["--name" "Alice"] cli-options)]
      (is (= "Alice" (:name options)))))

  (testing "parses -v verbose flag"
    (let [{:keys [options]} (parse-opts ["-v"] cli-options)]
      (is (true? (:verbose options))))))
